
export interface AccessTokenPayloadCreate{
   userId: number,
   deviceId:number,
   roleId:number,
   roleName:string
}
export interface RefresTokenPayloadCreate{
  userId:number
}
export interface AccessTokenPayload extends AccessTokenPayloadCreate {
  exp: number
  iat: number
}
export interface RefresTokenPayload extends RefresTokenPayloadCreate {
  exp: number
  iat: number
}