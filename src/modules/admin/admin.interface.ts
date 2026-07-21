import { UserStatus } from "../../../generated/prisma/enums.js";

export interface IUpdateUserStatusPayload {
  status: UserStatus;
}
