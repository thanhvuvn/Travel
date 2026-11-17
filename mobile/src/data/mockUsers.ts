import { ManagedUser } from '../types';

export const MOCK_USERS: ManagedUser[] = [
  {
    id: 'u-1',
    name: 'Nguyễn Văn Du Khách',
    email: 'dukhach@vivuai.vn',
    role: 'user',
    is_locked: false,
    created_at: '2026-11-01',
  },
  {
    id: 'u-2',
    name: 'Lê Thị Thuỷ Tiên',
    email: 'thuytien.travel@gmail.com',
    role: 'user',
    is_locked: false,
    created_at: '2026-11-03',
  },
  {
    id: 'u-3',
    name: 'Trần Bảo Long',
    email: 'long.tran@outlook.com',
    role: 'user',
    is_locked: true,
    created_at: '2026-11-05',
  },
  {
    id: 'u-4',
    name: 'Quản Trị Viên Vivu',
    email: 'admin@vivuai.vn',
    role: 'admin',
    is_locked: false,
    created_at: '2026-10-15',
  },
  {
    id: 'u-5',
    name: 'Đặng Minh Hoàng',
    email: 'hoang.danang@gmail.com',
    role: 'user',
    is_locked: false,
    created_at: '2026-11-10',
  },
];
