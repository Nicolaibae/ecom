import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import envConfig from 'src/shared/config'
import { GoogleAuthStateType } from './auth.model'
import { AuthRepository } from './auth.repo'
import {v4 as uuidv4 } from 'uuid'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { AuthService } from './auth.service'
import { SharedRoleRepository } from 'src/shared/repositories/share-role.repo'

@Injectable()
export class GoogleService {
    private oauth2Client: OAuth2Client
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly ShareRolesService: SharedRoleRepository,
        private readonly hashingService: HashingService,
        private readonly authService: AuthService
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            envConfig.GOOGLE_CLIENT_ID,
            envConfig.GOOGLE_CLIENT_SECRET,
            envConfig.GOOGLE_REDIRECT_URI
        )
    }
    getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
        const scope = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ]
        // chuyển object sang string rồi encode base64 an toàn bỏ lên url
        const stateString = Buffer.from(JSON.stringify({
            userAgent,
            ip,
        })).toString('base64')
        const url = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope,
            include_granted_scopes: true,
            state: stateString
        })

        return { url }

    }
    async googleCallback({ code, state }: { code: string, state: string }) {
        try {
            let userAgent = "Unknown"
            let ip = "Unknown"
            // 1. lấy sate từ url
            try {
                const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType
                userAgent = clientInfo.userAgent
                ip = clientInfo.ip
            } catch (error) {
                console.error('Error parsing state', error)
            }
            //2.dùng code để lấy access token
            const { tokens } = await this.oauth2Client.getToken(code)
            this.oauth2Client.setCredentials(tokens) //giúp client nhớ access_token và refresh_token đó
            //3 . lấy thông tin user từ google
            const oauth2 = google.oauth2({
                auth: this.oauth2Client,
                version: 'v2',
            })
            const { data } = await oauth2.userinfo.get()
            if (!data.email) {
                throw new Error('Không thể lấy thông tin người dùng từ google')
            }
            let user = await this.authRepository.findUniqueUserInclueRole({ email: data.email })
            if(!user){
                const clientRoleId = await this.ShareRolesService.getClientRoleId();
                const randomPassword = uuidv4()
                const hashedPassword = await this.hashingService.hash(randomPassword)
                user = await this.authRepository.createUserInclueRole({
                    email: data.email,
                    name: data.name??"",
                    password: hashedPassword,
                    roleId: clientRoleId,
                    phoneNumber: '',
                    avatar: data.picture??null,
                })
                const device = await this.authRepository.createDevice({
                    userId: user.id,
                    userAgent,
                    ip,
                })
                const authTokens = await this.authService.generateTokens({
                    userId: user.id,
                    deviceId: device.id,
                    roleId: user.roleId,
                    roleName: user.role.name
                })
                return authTokens
            }
        } catch (error) {
            console.error('Error in googleCallback', error)
            throw error
        }
    }
}