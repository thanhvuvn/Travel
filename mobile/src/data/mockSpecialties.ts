import { Area } from '../types';

export type VisionSampleKey =
  | 'miquang'
  | 'caolau'
  | 'banhtrangthitheo'
  | 'banhmiphuong'
  | 'caurong';

export interface SpecialtyDish {
  id: VisionSampleKey;
  name: string;
  emoji: string;
  area: Area;
  tagline: string;
  priceRange: string;
  image: string;
  story: string;
  howToEat: string;
  recommendedPlaceIds: string[];
  visionConfidence: number;
}

export const MOCK_SPECIALTIES: SpecialtyDish[] = [
  {
    id: 'miquang',
    name: 'Mì Quảng Tôm Thịt / Ếch',
    emoji: '🍜',
    area: 'danang',
    tagline: 'Linh hồn ẩm thực đất Quảng',
    priceRange: '45.000đ - 65.000đ',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    story:
      'Món ăn trứ danh của người Quảng Nam - Đà Nẵng. Sợi mì làm từ bột gạo xay mịn tráng mỏng, thoa lớp dầu phụng khử củ nén thơm lừng, chan nước nhưn đậm đà chỉ xâm xấp mặt mì.',
    howToEat:
      'Bẻ nhỏ bánh tráng mè nướng giòn vào tô, vắt thêm lát chanh, trộn đều cùng rau sống Trà Quế9 vị và cắn kèm ớt xanh xứ Quảng.',
    recommendedPlaceIds: ['dn01'],
    visionConfidence: 97,
  },
  {
    id: 'caolau',
    name: 'Cao Lầu Phố Cổ Hội An',
    emoji: '🥢',
    area: 'hoian',
    tagline: 'Tinh hoa 300 năm thương cảng Hội An',
    priceRange: '40.000đ - 55.000đ',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    story:
      'Sợi mì cao lầu vàng ươm, dai giòn đặc trưng nhờ nhào bột với tro củi tràm Cù Lao Chàm và nước giếng cổ Bá Lễ. Ăn kèm thịt xá xíu rim ngũ vị và tóp mỡ/da heo chiên giòn.',
    howToEat:
      'Trộn đều sợi cao lầu với nước sốt xá xíu đậm vị ở đáy tô, thêm chút tương ớt Hội An cay nồng và rau thơm Trà Quế.',
    recommendedPlaceIds: ['ha02'],
    visionConfidence: 96,
  },
  {
    id: 'banhtrangthitheo',
    name: 'Bánh Tráng Cuốn Thịt Heo 2 Đầu Da',
    emoji: '🌯',
    area: 'danang',
    tagline: 'Đặc sản cuốn chấm mắm nêm trứ danh',
    priceRange: '120.000đ - 160.000đ',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    story:
      'Thịt heo phần mông hoặc vai được luộc khéo để giữ nguyên hai lớp da ở hai đầu lát thịt, kết hợp cùng bánh tráng phơi sương Đại Lộc và lớp bánh ướt mềm mịn.',
    howToEat:
      'Trải bánh tráng khô, đặt lớp bánh ướt lên trên, xếp rau sống, chuối chát, khế chua, lát thịt heo hai đầu da rồi cuộn chặt, chấm ngập chén mắm nêm dứa thơm nồng.',
    recommendedPlaceIds: ['dn05'],
    visionConfidence: 95,
  },
  {
    id: 'banhmiphuong',
    name: 'Bánh Mì Hội An Giòn Rụm',
    emoji: '🥖',
    area: 'hoian',
    tagline: 'Bánh mì ngon nhất thế giới (Anthony Bourdain)',
    priceRange: '30.000đ - 45.000đ',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
    story:
      'Ổ bánh mì hai đầu nhọn nướng giòn rụm trên lò than, bên trong hòa quyện hơn 10 loại nhân: pate gan béo ngậy, chả lụa, thịt nướng, xá xíu và nước sốt gia truyền.',
    howToEat:
      'Thưởng thức ngay khi ổ bánh còn nóng giòn, chọn nhân thập cẩm để cảm nhận trọn vẹn vị béo của sốt bơ trứng và pate.',
    recommendedPlaceIds: ['ha03'],
    visionConfidence: 98,
  },
];
