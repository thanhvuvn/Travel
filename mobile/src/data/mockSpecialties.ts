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
  nameEn: string;
  emoji: string;
  area: Area;
  tagline: string;
  taglineEn: string;
  priceRange: string;
  image: string;
  story: string;
  storyEn: string;
  howToEat: string;
  howToEatEn: string;
  recommendedPlaceIds: string[];
  visionConfidence: number;
}

export const MOCK_SPECIALTIES: SpecialtyDish[] = [
  {
    id: 'miquang',
    name: 'Mì Quảng Tôm Thịt / Ếch',
    nameEn: 'Mi Quang (Turmeric Rice Noodles)',
    emoji: '🍜',
    area: 'danang',
    tagline: 'Linh hồn ẩm thực đất Quảng',
    taglineEn: 'The culinary soul of Quang region',
    priceRange: '45.000đ - 65.000đ',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    story:
      'Món ăn trứ danh của người Quảng Nam - Đà Nẵng. Sợi mì làm từ bột gạo xay mịn tráng mỏng, thoa lớp dầu phụng khử củ nén thơm lừng, chan nước nhưn đậm đà chỉ xâm xấp mặt mì.',
    storyEn:
      'Iconic specialty of Quang Nam – Da Nang. Flat rice noodles glazed with aromatic peanut oil and served with a rich, concentrated shrimp-pork or frog broth just coating the bottom.',
    howToEat:
      'Bẻ nhỏ bánh tráng mè nướng giòn vào tô, vắt thêm lát chanh, trộn đều cùng rau sống Trà Quế 9 vị và cắn kèm ớt xanh xứ Quảng.',
    howToEatEn:
      'Crumble toasted sesame rice crackers on top, squeeze fresh lime, toss with fresh Tra Que herbs, and enjoy with a crisp green chili.',
    recommendedPlaceIds: ['dn01'],
    visionConfidence: 97,
  },
  {
    id: 'caolau',
    name: 'Cao Lầu Phố Cổ Hội An',
    nameEn: 'Hoi An Cao Lau Noodles',
    emoji: '🥢',
    area: 'hoian',
    tagline: 'Tinh hoa 300 năm thương cảng Hội An',
    taglineEn: '300-year heritage of Hoi An trading port',
    priceRange: '40.000đ - 55.000đ',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    story:
      'Sợi mì cao lầu vàng ươm, dai giòn đặc trưng nhờ nhào bột với tro củi tràm Cù Lao Chàm và nước giếng cổ Bá Lễ. Ăn kèm thịt xá xíu rim ngũ vị và tóp mỡ/da heo chiên giòn.',
    storyEn:
      'Chewy golden noodles uniquely made with ash water from Cham Island trees and ancient Ba Le well water, topped with five-spice char siu pork and crispy croutons.',
    howToEat:
      'Trộn đều sợi cao lầu với nước sốt xá xíu đậm vị ở đáy tô, thêm chút tương ớt Hội An cay nồng và rau thơm Trà Quế.',
    howToEatEn:
      'Mix the noodles thoroughly with the savory char siu sauce at the bottom, add spicy Hoi An chili jam and fresh local herbs.',
    recommendedPlaceIds: ['ha02'],
    visionConfidence: 96,
  },
  {
    id: 'banhtrangthitheo',
    name: 'Bánh Tráng Cuốn Thịt Heo 2 Đầu Da',
    nameEn: 'Two-Skin Pork Rice Paper Rolls',
    emoji: '🌯',
    area: 'danang',
    tagline: 'Đặc sản cuốn chấm mắm nêm trứ danh',
    taglineEn: 'Signature rolls with fermented anchovy sauce',
    priceRange: '120.000đ - 160.000đ',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    story:
      'Thịt heo phần mông hoặc vai được luộc khéo để giữ nguyên hai lớp da ở hai đầu lát thịt, kết hợp cùng bánh tráng phơi sương Đại Lộc và lớp bánh ướt mềm mịn.',
    storyEn:
      'Delicately boiled pork sliced to keep tender skin on both ends, wrapped with Dai Loc dew-dried rice paper and soft steamed rice sheets.',
    howToEat:
      'Trải bánh tráng khô, đặt lớp bánh ướt lên trên, xếp rau sống, chuối chát, khế chua, lát thịt heo hai đầu da rồi cuộn chặt, chấm ngập chén mắm nêm dứa thơm nồng.',
    howToEatEn:
      'Layer dry and wet rice paper, add herbs, green banana, starfruit and pork, roll tightly and dip into aromatic pineapple fermented fish sauce.',
    recommendedPlaceIds: ['dn05'],
    visionConfidence: 95,
  },
  {
    id: 'banhmiphuong',
    name: 'Bánh Mì Hội An Giòn Rụm',
    nameEn: 'Crispy Hoi An Banh Mi Phuong',
    emoji: '🥖',
    area: 'hoian',
    tagline: 'Bánh mì ngon nhất thế giới (Anthony Bourdain)',
    taglineEn: 'World-famous symphony in a sandwich',
    priceRange: '30.000đ - 45.000đ',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
    story:
      'Ổ bánh mì hai đầu nhọn nướng giòn rụm trên lò than, bên trong hòa quyện hơn 10 loại nhân: pate gan béo ngậy, chả lụa, thịt nướng, xá xíu và nước sốt gia truyền.',
    storyEn:
      'Charcoal-toasted crispy baguette packed with over 10 fillings: rich liver pate, grilled pork, char siu, Vietnamese ham, fresh herbs and secret house sauce.',
    howToEat:
      'Thưởng thức ngay khi ổ bánh còn nóng giòn, chọn nhân thập cẩm để cảm nhận trọn vẹn vị béo của sốt bơ trứng và pate.',
    howToEatEn:
      'Enjoy immediately while hot and crunchy — order the mixed combo (Thap Cam) for the full flavor of egg butter and pate.',
    recommendedPlaceIds: ['ha03'],
    visionConfidence: 98,
  },
];
