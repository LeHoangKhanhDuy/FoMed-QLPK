// import type { User, UserID, UserStatus } from "../../types/user/user";

// const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// let AUTO_ID = 1000;
// const USERS: User[] = [
//   {
//     id: AUTO_ID++,
//     code: "BN0001",
//     name: "Nguyễn Văn A",
//     phone: "0901234567",
//     email: "a@example.com",
//     role: "patient",
//     status: "active",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: AUTO_ID++,
//     code: "NV0001",
//     name: "Trần Thị B",
//     phone: "0902223333",
//     email: "b@example.com",
//     role: "staff",
//     status: "active",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: AUTO_ID++,
//     code: "BS0001",
//     name: "Phạm Quốc C",
//     phone: "0903334444",
//     email: "c@example.com",
//     role: "doctor",
//     status: "inactive",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: AUTO_ID++,
//     code: "AD0001",
//     name: "Lê Thu D",
//     phone: "0904445555",
//     email: "d@example.com",
//     role: "admin",
//     status: "active",
//     createdAt: new Date().toISOString(),
//   },
// ];

// export async function apiListUsers(): Promise<User[]> {
//   await delay(200);
//   return [...USERS];
// }

// export async function apiCreateUser(
//   payload: Omit<User, "id" | "createdAt">
// ): Promise<User> {
//   await delay(200);
//   const u: User = {
//     ...payload,
//     id: AUTO_ID++,
//     createdAt: new Date().toISOString(),
//   };
//   USERS.unshift(u);
//   return u;
// }

// export async function apiUpdateUser(
//   id: UserID,
//   payload: Partial<Omit<User, "id" | "createdAt">>
// ): Promise<User> {
//   await delay(200);
//   const idx = USERS.findIndex((u) => u.id === id);
//   if (idx < 0) throw new Error("Không tìm thấy người dùng");
//   USERS[idx] = { ...USERS[idx], ...payload };
//   return USERS[idx];
// }

// export async function apiToggleStatus(
//   id: UserID,
//   status: UserStatus
// ): Promise<User> {
//   return apiUpdateUser(id, { status });
// }

