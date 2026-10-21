// Builds D:\Game\De_xuat_dai_duong_GD6.docx: the phase 6.1 proposal (big ocean, boat, fishing, fish catalogue, exchange gear). Nothing in it is built yet.
const d = require('docx'), fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, HeadingLevel, BorderStyle, PageOrientation } = d;
const W = 15038, B = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' }, BS = { top: B, bottom: B, left: B, right: B };
const run = (t, o) => new TextRun(Object.assign({ text: t, size: 16 }, o || {}));
const cell = (w, t, o) => new TableCell(Object.assign({ width: { size: w, type: WidthType.DXA }, borders: BS, margins: { top: 40, bottom: 40, left: 70, right: 70 }, children: [new Paragraph({ children: [run(t, (o && o.r) || {})] })] }, o && o.fill ? { shading: { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } } : {}));
const scale = (cols) => { const s = cols.reduce((a, b) => a + b, 0); return cols.map(c => Math.round(c * W / s)); };
const table = (cols0, head, rows) => { const cols = scale(cols0); return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cols, rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(cols[i], h, { fill: 'E8DDB5', r: { bold: true } })) })]
  .concat(rows.map(r => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(cols[i], String(t), i === 0 ? { r: { bold: true }, fill: String(r[0]).indexOf('★') >= 0 ? 'E3F2DF' : undefined } : {})) }))) }); };
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 100 }, children: [new TextRun(t)] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 }, children: [new TextRun(t)] });
const P = t => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: t, size: 20 })] });
const BL = (t, b) => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 40 }, children: b ? [new TextRun({ text: b, bold: true, size: 20 }), new TextRun({ text: t, size: 20 })] : [new TextRun({ text: t, size: 20 })] });
const OPT = ['Phương án', 'Nội dung', 'Công sức', 'Rủi ro'];
const optTable = rows => table([1500, 8500, 1100, 3900], OPT, rows);

const c = [];
c.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('LAST LANTERN · Giai đoạn 6.1: Đề xuất Đại Dương, câu cá, thuyền, đổi cá lấy đồ')] }));
c.push(P('Đây là bước 6.1: chỉ là đề xuất, chưa có dòng code nào. Mỗi mục có 2 phương án, ★ là phương án mình khuyên chọn. Số liệu "hiện có" lấy từ bản kiểm kê 6.0 và từ Giai đoạn 5 (đã làm: bến câu, thuyền chèo được, quái Reefjaw, 7 loài cá, nhiệm vụ cá của cướp biển).'));

// ---------------- 0. summary ----------------
c.push(H1('0. Tóm tắt và những điều cần bạn chốt'));
[
  ['Một map mới, không đụng map cũ. ', 'Làm "Biển Khơi" là một map ngang rất lớn (720×96 ô) có cảng, đảo, 3 vùng. Map Đại Dương Sâu Thẳm hiện tại (dọc, có Oktavor, ngọc trai, cửa thủy triều) giữ nguyên để không phá cốt truyện và cân bằng boss; từ Biển Khơi có một "Hố Chìm" dẫn xuống nó (mục J).'],
  ['Cá là tiền tệ, nên phải có kho cá. ', 'Cá bắt được vào khoang thuyền (có sức chứa), về cảng mới "dỡ cá" vào kho. Thuyền chìm thì mất một phần cá trong khoang. Đây là cái làm vòng lặp hồi hộp (mục B, C, I).'],
  ['Mọi con cá đổi được 1 con, bất kể hạng. ', 'Như bạn chốt. Để cá hiếm vẫn đáng giá, mình đề xuất cá hiếm cho thêm xu, ngọc trai, vật liệu mồi và phần thưởng sưu tầm (mục A, H). Cá đột biến/huyền thoại cũng chỉ tính 1 con khi đổi.'],
  ['Giữ nguyên 12.600 con và giá đã chốt, ', 'nhưng cho sản lượng tăng dần theo nâng cấp (lưới, khoang, kỹ năng, đàn cá) để 100 con đầu mất ~8 phút và 100 con cuối chỉ ~1,5 phút; làm hết mọi thứ khoảng 7-8 giờ chơi (mục H). Không cần giảm giá.'],
  ['Hệ hạng B/A/S/SS/SSS đã có sẵn trong game ', '(F-SSS, tính theo "tier" của đồ). Đồ mới sẽ gắn tier để ra đúng hạng, nên cửa hàng và các thẻ hạng hiện có dùng lại được. Cửa hàng vũ khí vàng/ngọc vẫn miễn phí như cũ; đổi cá là một quầy riêng.'],
  ['Cần chốt nút mới: ', 'thú cưỡi cần một nút lên/xuống (đề xuất phím V; tay cầm: giữ Y 0,5 giây; cảm ứng: nút mới). Hiện không có phím nào trùng.'],
  ['Phải kể thẳng: ', 'Reefjaw (quái hiện có) và thuyền hiện có được vẽ bằng code lúc chạy, chưa phải sprite sheet. Cá, quái, thuyền, thú cưỡi, súng, kiếm và chân dung NPC mới sẽ làm bằng bộ công cụ pixel hiện có (như boss ở Giai đoạn 3), có mẫu duyệt trước. Với cá hiếm, boss và chân dung, mình nói rõ ở mục K chỗ nào code vẽ chưa đẹp bằng họa sĩ.'],
].forEach(x => c.push(BL(x[1], x[0])));

// ---------------- A. fish ----------------
c.push(H1('A. Danh mục cá'));
c.push(optTable([
  ['PA1 ★ 45 loài đủ', '45 loài: B 12, A 12, S 10, SS 6, SSS 5. Mỗi loài có sprite riêng (nhỏ/vừa dùng khuôn thân + đổi màu và họa tiết, loài S trở lên vẽ tay từng con). Cá đột biến là biến thể màu/đốm của loài có sẵn; cá huyền thoại là 5 loài SSS.', 'Lớn', 'Lượng sprite lớn (~1.100 khung); chia đợt làm, có mẫu duyệt.'],
  ['PA2 30 loài + biến thể', '30 loài gốc, mỗi loài thêm 1-2 biến thể màu thành đủ "45 dạng". Ít khung hơn nhưng nhìn lặp lại.', 'Vừa', 'Không đạt "ít nhất 45 loài" nếu bạn muốn 45 loài thật sự khác nhau.'],
]));
c.push(P('Vùng: V1 = Vịnh Neo (gần cảng, an toàn); V2 = Biển Gió (ngoài khơi, quái bắt đầu rượt); V3 = Vực Xa (nguy hiểm, boss); R = rạn san hô quanh đảo; H = Hang Xoáy (ngầm); X = xác tàu. Giờ: Ngày / Hoàng hôn / Đêm / Đêm trăng. Thời tiết: Mưa, Bão, Sương mù, Thủy triều đỏ (mục D). Cỡ sprite là cỡ ô tính bằng pixel (rộng×cao) trong ô khung hình.'));
const FISH = [
  // B (12)
  ['1', 'Cá Tép Bạc', 'Silver Minnow', 'B', '16×10', 'V1', 'Mọi lúc; bầy', 'Bơi thành bầy 8-12 con, đổi hướng cùng lúc', 'Con cá nhỏ lấp lánh như mảnh gương vụn. (đã có)'],
  ['2', 'Cá Chép Đèn', 'Lantern Carp', 'B', '24×14', 'V1', 'Ngày, hoàng hôn', 'Bơi chậm, hay nổi lên mặt nước', 'Vảy cam sáng như đèn lồng nhỏ. (đã có)'],
  ['3', 'Cua Đá', 'Pebble Crab', 'B', '20×14', 'V1, R', 'Ngày; mồi giun', 'Bò ngang dưới đáy, rúc vào đá khi có bóng', 'Mai xám giống hòn cuội, chỉ lộ đôi mắt.'],
  ['4', 'Tôm Gõ', 'Knocker Shrimp', 'B', '18×12', 'R', 'Ngày; mồi tôm', 'Búng giật lùi, gõ vào đá nghe tách tách', 'Càng to bất thường, gõ như đang gửi mật mã.'],
  ['5', 'Sao Biển Cam', 'Ember Starfish', 'B', '20×20', 'V1, R', 'Ngày', 'Nằm đáy, xoay chậm, bám đá', 'Năm cánh cam đỏ như than còn ấm.'],
  ['6', 'Ốc Tù Và', 'Trumpet Conch', 'B', '18×18', 'V1', 'Mọi lúc', 'Trườn rất chậm; thỉnh thoảng thổi bong bóng', 'Vỏ xoắn, đưa tai vào nghe được tiếng biển.'],
  ['7', 'Sứa Bóng', 'Bubble Jelly', 'B', '20×24', 'V1', 'Đêm (phát sáng nhẹ)', 'Trôi theo dòng, co bóp lên xuống', 'Trong như bong bóng xà phòng, đèn mờ ở giữa.'],
  ['8', 'Cá Ngựa Chỉ', 'Thread Seahorse', 'B', '14×22', 'V1 (rong biển)', 'Ngày; mồi tôm', 'Đứng dọc, đuôi quấn rong, nhún nhẹ', 'Mảnh như sợi chỉ, đuôi cuộn tròn.'],
  ['9', 'Nhím Biển Tím', 'Violet Urchin', 'B', '20×18', 'V1, R', 'Mọi lúc', 'Nằm im; xù gai khi bị kéo', 'Gai tím nhọn, giữa là cái miệng nhỏ.'],
  ['10', 'Cá Mòi Bờ', 'Shore Sardine', 'B', '20×10', 'V1', 'Bình minh, hoàng hôn; bầy lớn', 'Bầy 15-25 con, lao thẳng rất nhanh', 'Bầy cá bạc tạo thành "dòng suối" sáng.'],
  ['11', 'Hải Quỳ Lục', 'Greenbloom Anemone', 'B', '20×22', 'R', 'Ngày', 'Đứng yên, xúc tu phất phơ', 'Như bó hoa xanh, chạm vào thì co lại.'],
  ['12', 'Cá Thòi Lòi', 'Mud Skipper', 'B', '20×12', 'V1 (bãi bùn)', 'Triều thấp', 'Nhảy trên mặt bùn và mặt nước', 'Cá biết đi, mắt lồi nhìn khắp nơi.'],
  // A (12)
  ['13', 'Cá Rô Gai', 'Spiny Perch', 'A', '28×16', 'V1, V2', 'Ngày; mồi tôm', 'Quẫy mạnh, lao ngang rất nhanh', 'Lưng đầy gai xanh. (đã có)'],
  ['14', 'Cá Vây Sáng', 'Glowfin', 'A', '28×16', 'V1, V2', 'Đêm', 'Bơi vòng tròn quanh nguồn sáng', 'Vây cyan phát sáng, hay đi theo đèn pha.'],
  ['15', 'Cá Nóc Phồng', 'Puffball Fish', 'A', '28×24', 'V1, V2', 'Mưa; mồi giun', 'Phồng tròn khi bị kéo, nổi lên mặt nước', 'Phồng thành quả bóng gai, trông hơi giận.'],
  ['16', 'Mực Ống Hồng', 'Rose Squid', 'A', '32×20', 'V2', 'Hoàng hôn, đêm; mồi tôm', 'Phụt nước lao thẳng, rồi lượn; phun mực', 'Đổi sắc hồng theo cảm xúc.'],
  ['17', 'Cá Đuối Cát', 'Sandwing Ray', 'A', '36×18', 'V2 (đáy cát)', 'Ngày', 'Lượn sát đáy, vỗ cánh dợn sóng', 'Cánh phẳng màu cát, hòa vào đáy.'],
  ['18', 'Cá Kiếm Non', 'Young Swordfish', 'A', '40×16', 'V2', 'Ngày; mồi thịt cá', 'Lao tên, đổi hướng gấp', 'Mõm nhọn như mũi giáo.'],
  ['19', 'Rùa Biển Xanh', 'Green Sea Turtle', 'A', '36×24', 'V2, R', 'Ngày', 'Chèo chậm, thở trên mặt nước', 'Mai xanh rêu, mang cả một vườn rêu nhỏ.'],
  ['20', 'Tôm Hùm Giáp', 'Armor Lobster', 'A', '32×20', 'R', 'Ngày; mồi giáp', 'Bò dưới đáy, kẹp càng đe dọa', 'Giáp xanh sẫm, càng như búa nhỏ.'],
  ['21', 'Cá Dao Ngọc', 'Jadeknife Fish', 'A', '40×12', 'V2', 'Hoàng hôn', 'Bơi ngang, đột ngột lao vọt', 'Dẹt như lưỡi dao, ánh xanh ngọc.'],
  ['22', 'Bạch Tuộc Hoa', 'Flower Octopus', 'A', '32×28', 'R, V2', 'Ngày; mồi tôm', 'Đổi màu theo nền, đột ngột bung xúc tu', 'Da nở hoa văn như bó hoa.'],
  ['23', 'Cá Đèn Lồng Con', 'Little Lantern Angler', 'A', '28×22', 'V2', 'Đêm; mồi sáng', 'Lơ lửng, cái đèn trên trán nhấp nháy', 'Bóng đèn nhỏ dụ cả cá khác.'],
  ['24', 'Sứa Hộp Điện', 'Sparkbox Jelly', 'A', '24×28', 'V2', 'Mưa, bão', 'Trôi, giật điện nhẹ khi chạm', 'Hình hộp, các tia điện chạy như ren.'],
  // S (10)
  ['25', 'Lươn Trăng', 'Moon Eel', 'S', '44×14', 'V2, V3', 'Đêm trăng', 'Uốn lượn chữ S, lặn sâu khi bị kéo', 'Vằn bạc như ánh trăng. (đã có)'],
  ['26', 'Cá Mập Vằn Ngầm', 'Striped Shiver Shark', 'S', '52×22', 'V2', 'Ngày; mồi máu', 'Lượn vòng, tấn công mồi', 'Vằn đen trên nền xám, răng chìa ra.'],
  ['27', 'Cá Đuối Quỷ', 'Sea Devil Ray', 'S', '56×30', 'V2', 'Hoàng hôn; mồi giáp', 'Lướt rộng, nhảy khỏi mặt nước', 'Hai "sừng" ở đầu, bụng đỏ.'],
  ['28', 'Lươn Bão', 'Stormeel', 'S', '56×16', 'V2, V3', 'Bão; mồi điện', 'Giật điện theo nhịp, quấn dây câu', 'Thân đen, tia điện chạy dọc lưng.'],
  ['29', 'Mực Ma', 'Ghost Squid', 'S', '48×30', 'V3', 'Sương mù; mồi mực', 'Trong suốt, chỉ thấy khi nó phun mực', 'Gần như vô hình, chỉ có đôi mắt.'],
  ['30', 'Cá Cờ Đỏ', 'Crimson Sailfish', 'S', '56×24', 'V2, V3', 'Ngày; mồi máu', 'Tốc độ cực nhanh, nhảy cao', 'Vây lưng đỏ như cánh buồm.'],
  ['31', 'Cua Hoàng Giáp', 'Emperor Plate Crab', 'S', '48×30', 'R, V2', 'Ngày; mồi giáp', 'Bò chậm, kẹp mạnh, khó kéo lên', 'Mai như bộ giáp, gắn vỏ sò làm huân chương.'],
  ['32', 'Rùa Đá Cổ', 'Old Stone Turtle', 'S', '56×32', 'R (quanh đảo)', 'Ngày', 'Rất chậm nhưng rất khỏe', 'Mai mọc rêu và cả một cây nhỏ.'],
  ['33', 'Cá Búa Vàng', 'Gold Hammerhead', 'S', '56×26', 'V2, V3', 'Hoàng hôn', 'Lắc đầu hai bên khi bơi, lao húc', 'Đầu búa ánh vàng như thỏi kim loại.'],
  ['34', 'Sứa Dù Rực', 'Radiant Parasol Jelly', 'S', '40×48', 'V2, V3', 'Đêm', 'Trôi, xúc tu dài hàng chục ô', 'Tán dù tỏa sáng như đèn lồng giấy.'],
  // SS (6)
  ['35', 'Cá Mặt Trăng Khổng', 'Giant Moonfish', 'SS', '64×48', 'V3', 'Đêm trăng', 'Tròn, chậm rãi, đột ngột lao xuống', 'Tròn vành vạnh như mặt trăng thứ hai.'],
  ['36', 'Cá Mập Mõm Sắt', 'Ironsnout Shark', 'SS', '72×28', 'V3', 'Thủy triều đỏ; mồi máu', 'Húc thuyền, vùng vẫy dữ', 'Mõm bọc giáp sắt rỉ.'],
  ['37', 'Bạch Tuộc Rạn Cổ', 'Elder Reef Octopus', 'SS', '64×44', 'H (hang xoáy)', 'Mồi mực', 'Quấn dây câu bằng nhiều xúc tu', 'Già đến mức san hô mọc trên đầu.'],
  ['38', 'Cá Đèn Lồng Vực', 'Abyss Lantern Angler', 'SS', '56×44', 'V3', 'Đêm; mồi sáng', 'Lơ lửng, dụ bằng đèn, đớp bất ngờ', 'Đèn trên trán to như quả cầu, răng như kim.'],
  ['39', 'Cá Voi Xương Non', 'Bonewhale Calf', 'SS', '80×40', 'V3', 'Sương mù', 'Lướt chậm, thở ra khói lạnh', 'Bộ xương cá voi còn mang bóng dáng sống.'],
  ['40', 'Lươn Giáp Rồng', 'Dragonscale Moray', 'SS', '72×20', 'X (xác tàu)', 'Đêm; mồi giáp', 'Thò ra từ khe, cắn rồi rụt vào', 'Vảy xếp như vảy rồng.'],
  // SSS (5)
  ['41', 'Cá Vàng', 'Golden Fish', 'SSS', '40×28', 'V1-V3 (hiếm)', 'Mọi lúc; rất hiếm', 'Đột ngột xuất hiện rồi biến mất, kéo cực khó', 'Vảy vàng thật. (đã có)'],
  ['42', 'Hải Long Cổ', 'Elder Sea Wyrm', 'SSS', '96×40', 'V3', 'Bão lớn; mồi hiếm', 'Trườn như rắn, phun nước', 'Rồng biển già, trán có hòn ngọc.'],
  ['43', 'Mực Khổng Nửa Đêm', 'Midnight Colossal Squid', 'SSS', '96×60', 'V3', 'Đêm trăng; mồi thịt Mực Bóng', 'Kéo thuyền, mắt to như chiếc đĩa', 'Màu xanh đêm, đốm sáng như bầu trời sao.'],
  ['44', 'Cá Pha Lê Ngàn Mắt', 'Thousand-Eye Crystalfish', 'SSS', '56×40', 'V3', 'Thủy triều đỏ; mồi pha lê', 'Trong suốt, nhìn theo người kéo', 'Thân pha lê, hàng trăm chấm như mắt.'],
  ['45', 'Rùa Đảo Cổ', 'Island Turtle', 'SSS', '112×56', 'Sự kiện "đảo hoang"', 'Sự kiện; không đánh thức nó', 'Rất chậm; cả một hòn đảo trên lưng', 'Đảo nhỏ có cây, có rương, nhưng bạn biết nó biết thở.'],
];
c.push(H2('Bảng 45 loài'));
c.push(table([3, 11, 12, 4, 6, 9, 14, 20, 22], ['#', 'Tên Việt', 'Tên Anh', 'Hạng', 'Cỡ ô', 'Vùng', 'Điều kiện (giờ / thời tiết / mồi)', 'Hành vi bơi', 'Mô tả'], FISH));
c.push(H2('Cá đột biến và cá huyền thoại'));
c.push(table([14, 9, 20, 24, 18], ['Dạng', 'Tỷ lệ', 'Điều kiện', 'Trông như thế nào', 'Thưởng (ngoài việc tính 1 con khi đổi)'], [
  ['Đột biến "Lấp Lánh"', '1/60 mỗi lần cắn', 'Mọi lúc, tăng khi đêm trăng', 'Đổi sang bảng màu sáng + hạt lấp lánh quanh thân', '+3 xu theo hạng; mở khung sưu tầm "Lấp Lánh" trong kho cá'],
  ['Đột biến "Đỏ Máu"', '1/90', 'Thủy triều đỏ', 'Thân đỏ sẫm, mắt trắng', 'Rơi 1 mồi Máu; mở khung "Đỏ Máu"'],
  ['Đột biến "Bóng Đêm"', '1/90', 'Đêm không trăng, sương mù', 'Thân đen, viền sáng cyan', 'Rơi vật liệu mồi Bóng; mở khung "Bóng Đêm"'],
  ['Huyền thoại (5 loài SSS)', 'Theo điều kiện riêng ở bảng trên', 'Đêm trăng / bão lớn / thủy triều đỏ / mồi hiếm / sự kiện', 'Có hiệu ứng riêng (ánh sáng, nước bắn, nhạc đổi)', '1 Ngọc Trai Quý cho lần đầu mỗi loài (tối đa 5), xu lớn, danh hiệu'],
  ['Ngọc Trai Quý (nguồn)', '-', 'Boss Mareth, 5 loài huyền thoại, sự kiện hiếm', '-', 'Dùng cho nâng cấp thuyền cấp cao, mở Vực Sâu (mục F)'],
]));
c.push(P('Quy tắc đổi: mọi con cá tính 1 con khi đổi, không phân biệt hạng, loài, đột biến (như bạn chốt). Cá hiếm đáng giá nhờ xu, ngọc, vật liệu mồi, khung sưu tầm; ăn cá để hồi máu (mục B). Phương án khác (đột biến tính 3 con, huyền thoại tính 10) làm đổi nhanh hơn nhưng trái quy tắc bạn đã chốt, nên mình để ở phần "câu hỏi mở".'));

// ---------------- B. mechanics ----------------
c.push(H1('B. Cơ chế câu cá'));
c.push(optTable([
  ['PA1 ★ 3 kiểu theo cỡ cá', 'Cá nhỏ: kim chạy (như hiện có, 1 nút). Cá vừa: "giữ dây": giữ E để cuộn, nhả E khi cá giật (thanh căng dây). Cá lớn: "đấu sức": dùng ←/→ theo hướng cá lao để giữ cá trong vùng, E để thở. Cá khổng lồ và boss: nhiều pha (cuộn, né, giữ). Một nút chính E, thêm ←/→ cho cá lớn, nên tay cầm và cảm ứng dùng được.', 'Lớn', 'Cần canh độ dài: cá nhỏ 5-8 giây, lớn 15-25 giây.'],
  ['PA2 1 kiểu duy nhất', 'Chỉ dùng kim chạy, cá hiếm làm kim nhanh và vùng xanh hẹp hơn. Ít code, nhưng sau vài trăm con sẽ nhàm.', 'Nhỏ', 'Với mục tiêu hàng nghìn con thì dễ chán.'],
]));
c.push(H2('Ba kiểu mini-game'));
c.push(table([9, 16, 30, 14, 14], ['Kiểu', 'Cá áp dụng', 'Cách chơi', 'Thời lượng', 'Thất bại thì'], [
  ['Kim chạy', 'Hạng B và phần lớn A (cỡ ô ≤ 40)', 'Cá cắn → kim chạy qua thanh, nhấn E khi kim nằm trong vùng xanh (vùng xanh hẹp dần theo hạng)', '3-8 giây', 'Cá thoát, mất mồi thường'],
  ['Giữ dây', 'A cỡ lớn, S, một số SS', 'Giữ E để cuộn; cá giật thì thanh căng dây đỏ lên: nhả E kịp thì dây không đứt; đưa thanh tiến độ đầy', '8-15 giây', 'Đứt dây: mất con cá và mồi'],
  ['Đấu sức', 'SS, SSS, quái ăn mồi', 'Cá lao trái/phải: bấm ←/→ để giữ nó giữa vùng; E để hồi sức; có 2-3 pha', '15-30 giây', 'Cá kéo thuyền đi / quái xuất hiện / đứt dây'],
]));
c.push(H2('Mồi'));
c.push(table([14, 20, 26, 14], ['Mồi', 'Cách có', 'Hiệu ứng', 'Rủi ro'], [
  ['Mồi giun', 'Bán ở cảng, giá rẻ (xu), dùng mãi không hết', 'Cá B, A thường', 'Không'],
  ['Mồi tôm', 'Làm từ Tôm Gõ', 'Tăng tỷ lệ cắn của A (mực, cá ngựa, bạch tuộc)', 'Không'],
  ['Mồi máu', 'Thịt Cá Nhồng Gai / Cá Mập', 'Dụ cá săn mồi S/SS (cá mập, cờ đỏ)', 'Quái ngửi thấy từ xa: +1 quái ở V2'],
  ['Mồi mực', 'Thịt Mực Bóng', 'Dụ mực, bạch tuộc, Mực Khổng Nửa Đêm', 'Có thể kéo thuyền'],
  ['Mồi điện', 'Thịt Sứa Chiến', 'Dụ lươn (S), tăng cá khi mưa bão', 'Giật điện nhẹ vào người câu'],
  ['Mồi giáp', 'Thịt Cua Giáp', 'Dụ cua, rùa, lươn giáp rồng', 'Không'],
  ['Mồi pha lê / Mồi Hậu', 'Mảnh pha lê từ sự kiện / thịt boss', 'Mồi pha lê dụ Cá Pha Lê; Mồi Hậu gọi boss Mareth', 'Gọi boss: phải chuẩn bị'],
]));
c.push(H2('Kỹ năng câu (cấp 1-20, tăng theo số cá bắt)'));
c.push(table([8, 30, 22], ['Cấp', 'Mở khóa', 'Đạt khi'], [
  ['2', 'Vùng xanh kim chạy rộng thêm 10%', '25 cá'], ['4', 'Cá nhỏ tự giật cần (không cần bấm)', '100 cá'], ['6', '"Mắt cá": thấy bóng cá dưới nước trước khi cắn', '250 cá'],
  ['8', 'Giữ dây: thanh căng chịu giật tốt hơn', '600 cá'], ['10', 'Mở khe mồi thứ 2 (2 loại mồi cùng lúc)', '1.200 cá'], ['13', 'Đấu sức: có thể "nghỉ" 1 lần', '2.500 cá'],
  ['16', 'Cá đột biến xuất hiện nhiều hơn 25%', '5.000 cá'], ['20', 'Danh hiệu "Cần Thủ Đại Dương" + hiệu ứng cần câu', '10.000 cá'],
]));
c.push(P('Ăn cá: tại khoang thuyền hoặc kho, "ăn" 1 con cá hồi 1 tim (cá S trở lên hồi nhiều hơn, tối đa 3 tim). Cá ăn rồi không còn đổi được, nên là lựa chọn thật sự khi đang gặp nguy.'));

// ---------------- C. boat upgrades ----------------
c.push(H1('C. Nâng cấp thuyền'));
c.push(optTable([
  ['PA1 ★ Trả bằng cá, cấp cao thêm ngọc trai', 'Nâng cấp thường trả bằng cá (đúng nhịp "cá là tiền"); các cấp cao nhất cần thêm Ngọc Trai Quý (kiếm từ boss, huyền thoại), để có mục tiêu lớn sau cùng.', 'Vừa', 'Nếu giá cá nâng cấp quá cao thì ăn mất cá dành cho đồ (đã tính ở mục H).'],
  ['PA2 Chỉ trả bằng ngọc trai', 'Ngọc trai là mốc duy nhất để nâng cấp. Dễ kiểm soát nhưng ngọc trai ít, người chơi đầu game bị "đóng băng" nâng cấp.', 'Vừa', 'Chậm nhịp; đoạn đầu thiếu cảm giác mạnh lên.'],
]));
c.push(table([15, 30, 12, 14, 18], ['Nâng cấp', 'Tác dụng', 'Cấp', 'Giá', 'Ghi chú'], [
  ['Khoang chứa lớn', 'Sức chứa khoang cá: 30 → 60 → 120 → 250 con', '3', '150 / 400 / 900 cá', 'Khoang đầy thì không câu thêm được; phải về cảng dỡ cá'],
  ['Lưới đánh cá', 'Thả lưới kéo theo thuyền 8 giây: lưới nhỏ 4-6 con, lưới lớn 10-16 con mỗi mẻ (theo vùng)', '2', '250 / 1.200 cá', 'Kéo lưới làm thuyền chậm 30% và thu hút quái'],
  ['Lưới bọc thép', 'Thân thuyền thêm 3 máu (6 tổng), giảm 1 sát thương mỗi cú cắn (tối thiểu 1)', '2', '600 cá / 2.000 cá + 2 ngọc', 'Tăng cảm giác chịu đòn trước Mareth'],
  ['Pháo tự động', 'Tự bắn quái gần nhất trong 9 ô, 1 phát/1,2 giây (cấp 2: bắn 2 nòng)', '2', '800 cá / 1.800 cá + 1 ngọc', 'Chỉ làm choáng/đẩy lui quái lớn, không giết boss nhanh'],
  ['Động cơ phản lực', 'Tăng tốc ×2,2 trong 3 giây, hồi 20 giây (cấp 2: hồi 12 giây)', '2', '1.000 cá + 1 ngọc / 2.500 cá + 2 ngọc', 'Dùng để chạy trốn; hết giờ thì nguội'],
  ['Đèn pha', 'Soi 12 ô phía trước vào ban đêm, thấy bóng cá, cá phát sáng cắn nhiều hơn', '1', '350 cá', 'Cũng dụ quái ngửi ánh sáng'],
  ['Phao cứu sinh', 'Khi thuyền vỡ, giữ lại toàn bộ cá trong khoang (1 lần, mua lại sau mỗi lần dùng)', '1 (tiêu hao)', '120 cá mỗi cái', 'Cân bằng cho người chơi mới; thay cho "phạt mất 25% cá"'],
]));
c.push(P('Thuyền vỡ (như hiện có: 3 cú cắn): mất 25% cá đang trong khoang (không mất cá đã dỡ về kho), thuyền được sửa ở cảng sau 25 giây, người chơi phải bơi về.'));

// ---------------- D. day night weather ----------------
c.push(H1('D. Ngày/đêm và thời tiết trên biển'));
c.push(optTable([
  ['PA1 ★ Theo đồng hồ thế giới, chu kỳ 10 phút', 'Một "ngày" 10 phút thật: 3 phút ngày, 1 phút hoàng hôn, 3 phút đêm (1 đêm trong 3 là đêm trăng), 1 phút bình minh... Thời tiết đổi ngẫu nhiên mỗi 3-6 phút, có báo hiệu trước 20 giây (mây, gió, âm). Giờ lấy từ đồng hồ của chủ phòng, đồng bộ cho co-op.', 'Vừa', 'Cần đồng bộ giờ và thời tiết qua mạng (ít dữ liệu: 1 số).'],
  ['PA2 Theo vị trí (giống 5 map trên cạn)', 'Giờ đổi theo khoảng cách từ cảng. Không cần đồng bộ nhưng đi xa luôn là đêm, ở lại cảng luôn là ngày, mất ý nghĩa chờ đêm trăng.', 'Nhỏ', 'Không có "đêm trăng" như một sự kiện chờ đợi.'],
]));
c.push(table([14, 20, 22, 22, 22], ['Hiện tượng', 'Cá', 'Quái', 'Rủi ro / ánh sáng', 'Âm thanh / nhạc'], [
  ['Ngày quang', 'Cá B/A bình thường', 'Ít quái (V2), V3 vẫn có', 'Thấp; sáng rõ', 'Sóng nhẹ, hải âu, nhạc phiêu lưu'],
  ['Hoàng hôn', 'Cá Búa Vàng, Cá Dao Ngọc, Mực xuất hiện', 'Quái V2 bắt đầu nhiều hơn', 'Vừa; trời cam', 'Nhạc chậm lại, chuông thuyền'],
  ['Đêm', 'Cá phát sáng, Cá Đèn Lồng, Sứa Dù, Mực', 'Quái V2 tăng, "Ma" ở V3 yếu', 'Tối: cần đèn pha; thấy bóng cá sáng', 'Dế biển, tiếng nước, nhạc bí ẩn'],
  ['Đêm trăng', 'Lươn Trăng, Cá Mặt Trăng, Mực Khổng Nửa Đêm', 'Boss có thể được triệu bằng Mồi Hậu', 'Sáng dịu; cá hiếm +50%', 'Nhạc trăng, tiếng hát xa xa'],
  ['Mưa', 'Cá Nóc, Sứa Hộp Điện, Lươn tăng', 'Sứa Chiến nhiều', 'Tầm nhìn giảm; sóng cao nhẹ', 'Tiếng mưa trên boong, sấm xa'],
  ['Bão', 'Lươn Bão, Hải Long Cổ có thể xuất hiện', 'Quái bay (chim quạ) hung hăng; Lươn Sét', 'Cao: sóng đẩy thuyền, sét đánh vào thuyền (1 máu) nếu đứng yên', 'Sóng gầm, sấm lớn, nhạc dồn dập'],
  ['Sương mù', 'Mực Ma, Cá Voi Xương, cá trong suốt', 'Hải Quỷ Xác Tàu (ma)', 'Tầm nhìn rất thấp; chỉ thấy gần thuyền', 'Gần như yên lặng, tiếng chuông xa'],
  ['Thủy triều đỏ', 'Cá Mập Mõm Sắt, Cá Pha Lê, đột biến Đỏ Máu', 'Quái hung hăng hơn (tốc độ +20%)', 'Nước đỏ, rất đáng sợ nhưng báo trước 20 giây', 'Trống trầm, nhạc căng thẳng'],
]));

// ---------------- E. events ----------------
c.push(H1('E. Sự kiện ngẫu nhiên'));
c.push(optTable([
  ['PA1 ★ Hệ sự kiện có đồng hồ', 'Mỗi 4-8 phút ở V2/V3 có thể xuất hiện 1 sự kiện (ngẫu nhiên có trọng số, không quá 1 sự kiện cùng lúc), có biểu tượng trên "la bàn", tồn tại 2-3 phút rồi biến mất. Có thể bật/tắt cho co-op để mọi người cùng thấy.', 'Lớn', 'Cần tính kỹ để không dồn dập; mặc định có vùng nghỉ.'],
  ['PA2 Sự kiện cố định tại điểm', 'Mỗi sự kiện ở một vị trí cố định, bật khi tới gần. Dễ kiểm tra nhưng đoán trước được, ít bất ngờ.', 'Vừa', 'Ít hồi hộp.'],
]));
c.push(table([16, 28, 22, 22], ['Sự kiện', 'Xảy ra', 'Phần thưởng', 'Rủi ro'], [
  ['Thương nhân bí ẩn', 'Một thuyền buồm đen xuất hiện lúc hoàng hôn, dừng 3 phút', 'Mua mồi hiếm, bộ phận thuyền, Mồi pha lê bằng cá', 'Không có (chỉ mất thời gian)'],
  ['Đảo hoang tự nổi', 'Một hòn đảo "nhô" lên giữa V2; thực ra là Rùa Đảo Cổ (SSS)', 'Rương, điểm câu mới, cơ hội bắt Rùa Đảo', 'Đánh thức nó nếu đánh quái trên đảo; nó lặn và hất người xuống nước'],
  ['Vùng nước xoáy', 'Xoáy nước lớn trên V2/V3', 'Bị hút xuống Hang Xoáy: phòng kho báu, Bạch Tuộc Rạn Cổ', 'Quái trong hang; lối ra bằng cột bong bóng, mất cá chưa dỡ nếu thuyền chìm'],
  ['Tàu đắm', 'Xác tàu hiện trên mặt nước vào đêm/sương', 'Rương, Lươn Giáp Rồng, vật liệu mồi', 'Hải Quỷ Xác Tàu (ma) xuất hiện khi lấy rương'],
  ['Đàn cá khổng lồ', 'Bóng đàn cá lớn dưới mặt nước, kèm đàn hải âu', '40-60 con cá trong 2 phút, mẻ lưới ×3', 'Thu hút quái; phải bảo vệ thuyền khi vớt'],
  ['Tín hiệu cầu cứu', 'Một thủy thủ trôi trên phao ở V3', 'Ngọc Trai Quý hoặc mồi hiếm', 'Quái săn quanh phao'],
]));

// ---------------- F. monsters ----------------
c.push(H1('F. Quái biển, boss và Ngọc Trai Quý'));
c.push(optTable([
  ['PA1 ★ Quái rượt theo ranh giới an toàn (mở rộng cách đang có)', 'Như Reefjaw ở Giai đoạn 5: có báo hiệu, rượt tới khi bạn về vùng an toàn thì dừng và chìm. Mỗi vùng có ranh giới riêng (V2: cách cảng 25 ô, V3: 70 ô), có báo hiệu 2 giây, có đường chạy trốn về phía cảng.', 'Vừa', 'Cần canh tốc độ quái so với thuyền (thuyền cơ bản 70 px/s, nâng cấp tới 154 px/s).'],
  ['PA2 Quái săn cả vùng', 'Quái được thả trong vùng và có thể đuổi tới mọi chỗ trong vùng đó. Căng hơn nhưng dễ ức chế khi kẹt giữa đường.', 'Vừa', 'Dễ gây ức chế, mâu thuẫn với "có đường chạy trốn".'],
]));
c.push(table([14, 8, 22, 22, 18, 14], ['Quái', 'Vùng', 'Hành vi tấn công', 'Báo hiệu và cách đối phó', 'Rơi (thịt làm mồi)', 'Kích thước'], [
  ['Cua Cắt Dây', 'V1', 'Bò lên thuyền cắt dây câu (làm hỏng 1 lần câu)', 'Hiện bóng nhỏ trên mạn; bắn/chém', 'Không', '20×14'],
  ['Cá Nhồng Gai (Spikejaw)', 'V2', 'Lao thẳng đâm thuyền 2 lần rồi rút', 'Vây nổi lên 1 giây; né sang bên', 'Thịt Máu', '40×18'],
  ['Sứa Chiến (Warjelly)', 'V2', 'Đàn 3-5 con, áp sát giật điện', 'Phát sáng khi sạc 1 giây; bắn hoặc bỏ chạy', 'Thịt Điện', '28×32'],
  ['Chim Quạ Biển (Gullraven)', 'V2', 'Bay xuống cướp cá trong khoang (không gây sát thương)', 'Bóng trên mặt nước; bắn hoặc che khoang', 'Không', '30×18'],
  ['Rắn Biển Muối (Brine Serpent)', 'V2', 'Vòng quanh thuyền rồi siết', 'Xoáy nước nhỏ khi nó tới; chạy thẳng', 'Thịt Điện/Máu', '88×20'],
  ['Reefjaw (đã có)', 'V2 xa', 'Quái tinh nhuệ: nhảy lên cắn thuyền', 'Vây + gợn sóng (đã có)', 'Thịt Giáp', '56×40'],
  ['Cá Mập Búa Sắt (Ironhammer Shark)', 'V3', 'Húc thuyền từ phía dưới, đẩy lùi mạnh', 'Bóng lớn và nước bọt; tăng ga để né', 'Thịt Máu hiếm', '88×30'],
  ['Mực Bóng (Shadow Squid)', 'V3', 'Phun mực làm mù; xúc tu quấn thuyền', 'Đám mực đen lan trên mặt nước; bắn xúc tu', 'Thịt Mực', '70×44'],
  ['Lươn Sét Khổng (Stormeel)', 'V3 khi bão', 'Phóng sét theo chuỗi vào thuyền', 'Mây đen trên đầu; đứng xa chỗ dây sét', 'Thịt Điện hiếm', '96×20'],
  ['Hải Quỷ Xác Tàu (Wreck Wraith)', 'V3 sương/xác tàu', 'Ma tàu đâm xuyên qua, làm chậm', 'Chuông xa; bật đèn pha để đẩy lùi', 'Mảnh pha lê', '64×48'],
]));
c.push(H2('Boss đại dương: Mareth, Mẹ Vực Thẳm'));
c.push(P('Một con cá đèn lồng khổng lồ làm tổ ở rãnh sâu nhất của Vực Xa (không dùng chung với Oktavor của map cũ). Cái đèn của nó dụ cả đàn cá nhỏ, nó ẩn trong bóng tối và chỉ lộ ra khi cắn. Ba pha: (1) dụ bằng đèn rồi lao cắn thuyền; (2) thả bầy cá đèn con tự nổ; (3) nuốt cả vùng nước, người chơi phải tìm chỗ sáng. Có thể gọi bằng Mồi Hậu hoặc gặp tự nhiên ở rãnh. Rơi 1 Ngọc Trai Quý cho mỗi lần hạ (có thời gian chờ 10 phút để tránh cày), thịt Mareth làm Mồi Hậu.'));
c.push(P('Ngọc Trai Quý: tiền tệ cho nâng cấp thuyền cấp cao, và chìa mở "Rãnh Sâu" (khu cuối của Vực Xa). Nguồn: boss (1/lần), 5 loài huyền thoại (1 lần đầu mỗi loài), một số sự kiện (tín hiệu cầu cứu). Tổng khoảng 20 ngọc cho cả trò chơi.'));

// ---------------- G. gear ----------------
c.push(H1('G. 5 kiếm, 10 súng, 5 thú cưỡi'));
c.push(P('Đã kiểm tra trùng: game đang có 37 kiếm, 20 súng, 31 pet, 31 giáp, 30 vũ khí đặc biệt. Tên bên dưới không trùng tên nào (đã đối chiếu danh sách). Kỹ năng bên dưới khác kỹ năng đang có: hiện có đạn tìm mục tiêu, đạn xuyên, chuỗi sét, hố đen, làm chậm, đóng băng, đốt cháy, vòng sao và triệu hồi. Những thứ MỚI thật sự: kéo bằng lao, mù mực, bọt giam, nảy giữa quái, mưa đạn, quay ngược vị trí và máu, cuồng xạ 5 giây, nhân bản đạn, đạn dịch chuyển, dừng thời gian. Kiếm sấm và kiếm băng của bạn trùng chủ đề với Thunderpeal/Glacierfang, nên mình đổi cách hoạt động để khác (xem bảng).'));
c.push(optTable([
  ['PA1 ★ Đồ gắn vào hệ sẵn có', 'Kiếm và súng là đồ loại sword/gun như hiện có, dùng chung ô vũ khí và phím kỹ năng 1-2; thú cưỡi là loại mới "mount" với ô riêng. Hạng lấy từ tier có sẵn (B: tier 9-11, A: 12-14, S: 15-16, SS: 17-18, SSS: 19+).', 'Vừa', 'Cần thêm một ô "thú cưỡi" ở túi đồ và đồng bộ trong co-op.'],
  ['PA2 Đồ mới thành một danh mục riêng', 'Mở một túi riêng cho đồ "Đại Dương". Tách biệt nhưng ra nhiều giao diện và nhiều chỗ phải sửa.', 'Lớn', 'Nhiều mã lặp, dễ lỗi.'],
]));
c.push(H2('5 kiếm'));
c.push(table([5, 14, 14, 6, 8, 38, 12], ['#', 'Tên Việt', 'Tên Anh', 'Hạng', 'Giá (cá)', 'Ngoại hình và kỹ năng', 'Hồi chiêu / cân bằng'], [
  ['1', 'Kiếm Xương Cá', 'Bonefin Blade', 'B', '100', 'Lưỡi trắng xương, có vây xương mép. Mỗi 4 nhát tung một vệt nước (xuyên 2 quái). Kỹ năng thường: vệt nước lớn hơn.', 'Sát thương +4, tốc độ chuẩn (khoảng đồ B hiện có +3..+5); skill tích 12 nhát'],
  ['2', 'Kiếm Răng Nhồng', 'Spikejaw Saber', 'B', '300', 'Lưỡi cong có hàng răng cá. Mỗi nhát thứ 3 gây "vết cắn": quái mất thêm 1 máu mỗi giây trong 3 giây (khác độc: không lan).', '+5, tốc độ nhanh 0,85 (khoảng B+); skill tích 12 nhát'],
  ['3', 'Kiếm Chớp Biển', 'Squallbrand', 'S', '800', 'Lưỡi xanh thẫm có tia sét xoáy. KỸ NĂNG: triệu sấm chớp: 3 tia sét giáng xuống 3 quái gần nhất và để lại vũng điện 4 giây (quái đứng trong vũng bị giật). Khác Thunderpeal (triệu hồi) và Storm Cutter (chuỗi).', '+9 (như S); hồi 14 giây; tích 12 nhát'],
  ['4', 'Kiếm Neo Tàu', 'Anchorblade', 'S', '800', 'Thanh kiếm to bản như cái neo, đầu có móc. Mỗi nhát thứ 3 làm choáng 1,2 giây; KỸ NĂNG: đập nền làm choáng mọi quái trong 5 ô 2 giây (không áp dụng lên boss: boss choáng 0,6 giây).', '+9, tốc độ chậm 1,15 (đổi bằng choáng); hồi 16 giây'],
  ['5', 'Kiếm Triều Băng', 'Rimetide', 'SSS', '1.000', 'Lưỡi pha lê xanh, rìa như sóng đông cứng. KỸ NĂNG: đóng băng: chém thành hình quạt đóng băng quái 3 giây VÀ tạo cầu băng trên mặt nước (dài 8 ô, tồn tại 8 giây) để đi bộ qua biển. Khác Glacierfang/Ice Age: có tác dụng di chuyển.', '+12; hồi 22 giây; không đóng băng boss quá 1,5 giây'],
]));
c.push(H2('10 súng'));
c.push(table([4, 14, 15, 5, 7, 36, 12, 12], ['#', 'Tên Việt', 'Tên Anh', 'Hạng', 'Giá (cá)', 'Kỹ năng (khác nhau)', 'Hồi chiêu', 'Cân bằng'], [
  ['1', 'Súng Phóng Lao', 'Harpoon Gun', 'A', '100', 'Bắn lao xuyên rồi KÉO quái (hoặc cá) về phía bạn; dùng được để câu cá từ xa.', '8 giây', 'Hạng A: đạn 4, cd 1,0'],
  ['2', 'Súng Tia Mực', 'Inkshot', 'A', '100', 'Mỗi 5 phát bắn quả cầu mực: quái trong vùng bị MÙ 3 giây (đánh trượt, đi lệch).', 'Theo phát', 'A: mag 8, cd 0,5'],
  ['3', 'Súng Bọt', 'Bubble Rifle', 'A', '100', 'Đạn thành bong bóng nhốt quái 2 giây (bay lên, không tấn công); boss chỉ bị chậm.', 'Theo phát', 'A: mag 6, cd 0,7'],
  ['4', 'Súng Càng Cua', 'Claw Cannon', 'A', '100', 'Đạn NẢY qua tối đa 3 quái (mỗi lần nảy giảm 20% sát thương).', 'Theo phát', 'A: mag 5, cd 0,8'],
  ['5', 'Súng Muối Rơi', 'Brine Scatter', 'A', '100', 'Mỗi 6 phát: bắn lên trời rồi MƯA ĐẠN rơi xuống vùng 5 ô trong 2 giây.', 'Theo phát', 'A: mag 6, cd 0,9'],
  ['6', 'Súng Quay Triều', 'Tidewarden Revolver', 'SSS', '1.000', 'QUAY NGƯỢC 5 giây: đưa vị trí và máu của NGƯỜI CHƠI về như 5 giây trước (không khôi phục thế giới, quái, boss, vật phẩm).', '40 giây', 'Không dùng được trong 3 giây đầu của trận boss để tránh lạm dụng'],
  ['7', 'Súng Bão Liên', 'Typhoon Repeater', 'SSS', '1.000', 'CUỒNG XẠ 5 giây: tốc độ bắn ×3, không tốn đạn, đạn hơi tỏa.', '25 giây', 'SSS: mag 40, cd 0,25'],
  ['8', 'Súng Gương Vây', 'Mirrorfin', 'SSS', '1.000', 'NHÂN BẢN: mỗi viên tách làm 2 sau 0,3 giây; kỹ năng: 10 viên kế tiếp nhân thành 3.', '20 giây', 'SSS: mag 20, cd 0,35'],
  ['9', 'Súng Dịch Mang', 'Warpgill', 'SSS', '1.000', 'Đạn đánh dấu điểm; nhấn kỹ năng để DỊCH CHUYỂN tới chỗ đạn rơi và nổ nhỏ ở đó (không xuyên tường).', '10 giây', 'SSS: mag 10, cd 0,6'],
  ['10', 'Súng Đứng Nước', 'Stillwater Pistol', 'SSS', '1.000', 'DỪNG THỜI GIAN 2,5 giây: quái, boss, đạn địch đứng yên; người chơi vẫn di chuyển. (Hourglass hiện chỉ làm chậm 40%.)', '45 giây', 'Boss chỉ đứng yên 1,2 giây'],
]));
c.push(P('Sát thương cụ thể được canh theo súng cùng hạng hiện có (theo số đạn và nhịp bắn), ở bước 6 sẽ đo bằng thử trong game trước khi chốt.'));
c.push(H2('5 thú cưỡi'));
c.push(optTable([
  ['PA1 ★ Cưỡi ở biển (Biển Khơi, Đại Dương, cảng)', 'Mọi thú cưỡi là thú biển; chỉ cưỡi được trong nước/trên mặt nước. Lên/xuống bằng nút V (tay cầm: giữ Y; cảm ứng: nút mới). Không ảnh hưởng độ khó và hình học các map trên cạn.', 'Vừa', 'Các map trên cạn không dùng được đồ đã mua (chấp nhận, nói rõ trong mô tả).'],
  ['PA2 Cưỡi mọi nơi (có dạng trên cạn)', 'Mỗi thú có dạng đi bộ trên cạn. Thích hơn nhưng phải thiết kế lại va chạm và cân bằng cho cả 10 map.', 'Rất lớn', 'Rủi ro cân bằng/kẹt rất cao; mình không khuyên.'],
]));
c.push(table([4, 14, 16, 5, 7, 24, 24, 16], ['#', 'Tên Việt', 'Tên Anh', 'Hạng', 'Giá (cá)', 'Điều khiển và tốc độ', 'Lợi thế riêng', 'Va chạm / lên xuống'], [
  ['1', 'Hải Mã Chiến', 'Warseahorse', 'S', '800', 'Bơi 1,6× thuyền; dash lao mũi giáo (hồi 6 giây)', 'Bơi nhanh nhất; đâm quái nhỏ (1 sát thương)', 'Hitbox nhỏ gọn; lên bằng V, xuống nhảy lên mặt nước'],
  ['2', 'Cá Đuối Gió', 'Galeray', 'S', '800', 'Lướt trên mặt nước ×1,5; nhảy vọt qua sóng/sương', 'Phá sóng, không bị dòng chảy đẩy', 'Chỉ trên mặt nước; hitbox rộng nhưng thấp'],
  ['3', 'Rùa Giáp Biển', 'Bulwark Turtle', 'S', '800', 'Chậm 0,8× nhưng chịu 3 cú đánh trước khi "vỏ" vỡ', 'Mang thêm +25 cá, lá chắn che lưng', 'Hitbox lớn; cưỡi lâu thì tự hồi vỏ'],
  ['4', 'Cá Heo Sét', 'Voltdolphin', 'S', '800', 'Bơi 1,3×; dash phóng điện (hồi 8 giây)', 'Dash làm choáng quái nhỏ 1 giây; nhảy qua dòng', 'Hitbox trung bình; có thể nhảy cao qua miệng hố'],
  ['5', 'Giao Long Xanh', 'Azure Wyrmfin', 'SS', '900', 'Bơi 1,5×; có thể bay ngắn trên mặt nước 2 giây', 'Phun cột nước tấn công (3 sát thương), hồi 10 giây; mang thêm +15 cá', 'Hitbox lớn; mất sức bay sau 2 giây rồi rơi xuống nước'],
]));
c.push(P('Cách điều khiển chung: V lên/xuống; ←/→ để bơi, Space để nhảy/vọt (cá heo, đuối), K/Shift để dash. Chết/ngã: tự xuống thú. Co-op: người khác thấy thú cưỡi; một con thú chỉ chở 1 người. Mount không xung đột với pet (ô riêng) và kỹ năng triệu hồi (không dùng chung phím).'));

// ---------------- H. balance ----------------
c.push(H1('H. Cân bằng thời gian chơi (12.600 con cá)'));
c.push(P('Tổng: 5 kiếm 100+300+800+800+1.000 = 3.000; 10 súng 5×100 + 5×1.000 = 5.500; 5 thú cưỡi 4×800 + 900 = 4.100. Tổng 12.600. Nâng cấp thuyền ăn thêm ~8.000 cá nếu mua hết, nên ta tính cả nó vào khối lượng.'));
c.push(optTable([
  ['PA1 ★ Giữ giá, tăng sản lượng theo giai đoạn', 'Giữ nguyên các giá bạn đã chốt. Sản lượng tăng từ 12 con/phút (chỉ cần câu) lên 70 con/phút (lưới lớn + khoang lớn + kỹ năng + đàn cá), nên người chơi thấy mình "mạnh lên" rõ rệt và không phải cày nhàm. Nâng cấp thuyền, kỹ năng câu và đàn cá khổng lồ là các đòn bẩy.', 'Vừa', 'Cần đo thật trong game ở bước 11 và chỉnh hệ số.'],
  ['PA2 Giảm giá một nửa', 'Chia đôi giá (tổng 6.300) để không cần tăng sản lượng. Dễ làm nhưng đi ngược quyết định giá của bạn và kết thúc nhanh (~4 giờ).', 'Nhỏ', 'Phải xin bạn đổi giá đã chốt.'],
]));
c.push(table([34, 14, 14, 16, 22], ['Giai đoạn (công cụ)', 'Cá/phút', 'Số cá từ-đến', 'Phút giai đoạn', 'Tích lũy'], [
  ['Chỉ cần câu + mồi thường, kỹ năng 1', '12', '0-300', '25', '25 phút'],
  ['Lưới nhỏ + khoang 60 + kỹ năng 5', '25', '300-1.500', '48', '73 phút'],
  ['Lưới lớn + động cơ + kỹ năng 10 + đàn cá', '45', '1.500-5.000', '78', '151 phút'],
  ['Lưới bọc thép + khoang 250 + kỹ năng 15-20 + đàn khổng lồ', '70', '5.000-12.600', '109', '259 phút'],
]));
c.push(BL('100 con cá: ~8 phút lúc đầu, ~4 phút giữa chặng, ~1,5 phút cuối. Món đầu (kiếm B 100 con) có sau ~8 phút; kiếm 300 con ~25 phút.', 'Mục tiêu: '));
c.push(BL('Tổng thời gian câu thuần ~4,3 giờ; cộng chạy tàu, chiến đấu, sự kiện, về cảng dỡ cá (×1,7) thì làm hết mọi thứ cỡ 7-8 giờ. Không ép phải làm hết: một người chơi bình thường sẽ nhắm 2-4 món.', 'Tổng: '));
c.push(BL('1 mẻ lưới (8 giây kéo) 4-16 con tùy cấp và vùng; đàn khổng lồ 40-60 con trong 2 phút; câu cần 1 con/10 giây ở cấp đầu, 1 con/5 giây khi kỹ năng cao. Khoang chứa 30 → 250 con quy định nhịp "ra khơi - về cảng".', 'Cách đạt tốc độ: '));
c.push(BL('Cá chỉ vào kho khi về cảng (khoang không tính), giới hạn mẻ lưới theo thời gian chờ (không xả liên tục), cá sinh ra theo "ngân sách" mỗi vùng chứ không vô hạn tại một điểm, thuyền chạy chậm khi kéo lưới. Không có cách cày bằng cách ra vào map hay lưu/nạp lại (kho chỉ ghi khi dỡ cá).', 'Chống cày lỗi: '));

// ---------------- I. loop ----------------
c.push(H1('I. Vòng lặp nhịp độ'));
c.push(optTable([
  ['PA1 ★ Sóng nhịp 4-6 phút', 'Chu kỳ: Cảng (an toàn) → ra khơi (V1: yên) → câu cá/thả lưới (V2) → có báo hiệu → quái xuất hiện → chiến đấu hoặc chạy về ranh an toàn → câu tiếp hoặc về cảng dỡ cá → đổi thưởng/nâng cấp → ra khơi xa hơn. Luôn có: vùng nghỉ (V1 và quanh phao), báo hiệu 2 giây trước quái, đường chạy về phía cảng.', 'Vừa', 'Phải đo cảm giác ở bước 11.'],
  ['PA2 Liên tục không nghỉ', 'Quái xuất hiện đều đặn không có chu kỳ nghỉ. Căng hơn nhưng dễ ức chế và đi ngược mục tiêu "không ức chế".', 'Nhỏ', 'Dễ gây mệt.'],
]));
c.push(table([14, 40, 20], ['Pha', 'Việc người chơi làm', 'Cảm giác'], [
  ['1. Chuẩn bị (cảng)', 'Dỡ cá, đổi đồ, nâng cấp, mua mồi, nói chuyện với NPC', 'An toàn, được thưởng'],
  ['2. Ra khơi (V1)', 'Chèo ra, câu cá nhỏ, thấy cá hiếm trên bóng nước', 'Yên bình, quen tay'],
  ['3. Săn cá (V2)', 'Câu cá vừa/lớn, thả lưới, chờ sự kiện; phao ranh giới báo "vùng nguy hiểm"', 'Hào hứng, bắt đầu căng'],
  ['4. Báo hiệu', 'Vây nổi / mực loang / còi tàu; 2 giây để quyết', 'Hồi hộp'],
  ['5. Quái xuất hiện', 'Chiến đấu (pháo, súng, kiếm) hoặc chạy về ranh an toàn (động cơ phản lực)', 'Căng nhưng có lối thoát'],
  ['6. Kết thúc', 'Quái dừng ở ranh; về cảng dỡ cá; hoặc thuyền vỡ, bơi về', 'Nhẹ nhõm / tiếc nuối'],
]));

// ---------------- J. map ----------------
c.push(H1('J. Mở rộng map'));
c.push(optTable([
  ['PA1 ★ Map mới "Biển Khơi" 720×96 ô', 'Một map ngang mới, vào từ bản đồ thế giới và từ bến tàu của Đại Dương Sâu Thẳm. Có 3 vùng theo khoảng cách, cảng ở phía tây, 6 đảo, hang xoáy, rãnh của boss. Có "Hố Chìm" dẫn xuống map Đại Dương cũ (giữ nguyên). Map cũ không bị đổi.', 'Lớn', 'Phải làm bộ sinh map ngang cho nước (khác bộ sinh hiện có), đồng bộ co-op cho map rộng.'],
  ['PA2 Mở rộng map Đại Dương cũ', 'Kéo rộng map hiện có từ 84 lên ~480 ô và thêm vùng mới. Ít map hơn nhưng đụng vào đấu trường Oktavor, cửa thủy triều và nhiệm vụ ngọc trai (nguy cơ phá cân bằng).', 'Lớn', 'Dễ làm hỏng bản cân bằng boss/câu chuyện.'],
]));
c.push(table([16, 14, 36, 24], ['Vùng', 'Tọa độ (ô)', 'Đặc điểm', 'Điểm lưu/dịch chuyển'], [
  ['Cảng Neo (V0)', '0-60', 'Cảng, 3 NPC bán/đổi, quầy mồi, xưởng thuyền, chợ cá, đài la bàn; hoàn toàn an toàn', 'Bến tàu (điểm hồi sinh)'],
  ['Vịnh Neo (V1)', '60-160', 'Nước nông, cá nhỏ, rạn san hô, 2 đảo nhỏ; không quái (trừ Cua Cắt Dây)', 'Phao 1 (hồi sinh, dịch chuyển nhanh)'],
  ['Biển Gió (V2)', '160-440', 'Nước sâu vừa, quái bắt đầu rượt, 3 đảo, thương nhân, đàn cá', 'Phao 2 (ranh an toàn thứ nhất), Phao 3'],
  ['Vực Xa (V3)', '440-720', 'Rất sâu, sương mù, xác tàu, Hang Xoáy, Rãnh Mareth, Hố Chìm', 'Phao 4, Phao 5 (ranh an toàn thứ hai), Hải đăng chìm'],
]));
c.push(P('Điểm lưu/dịch chuyển nhanh trên biển: dùng các "Phao Hải Đăng" như checkpoint của map trên cạn (đã có cơ chế dịch chuyển checkpoint). Dịch chuyển bị khóa khi có quái đuổi hoặc đang đánh boss.'));

// ---------------- K. sprites ----------------
c.push(H1('K. Danh sách sprite và animation'));
c.push(optTable([
  ['PA1 ★ Vẽ bằng bộ công cụ pixel (như boss, triệu hồi), có mẫu duyệt', 'Dùng bộ công cụ code có sẵn (tools/pixel): khuôn thân cá + bảng màu cho cá B/A (khoảng 14 khuôn), vẽ riêng từng con cho S/SS/SSS, quái, boss, thuyền, thú cưỡi, súng, kiếm. Với mỗi nhóm làm 1-2 mẫu cho bạn duyệt rồi mới làm hàng loạt. Chân dung NPC vẽ bằng code từ bộ mẫu mặt có sẵn.', 'Rất lớn', 'Mình đã nói thẳng ở Giai đoạn 3: code vẽ chưa đẹp bằng họa sĩ ở chỗ mềm (mặt, lông, vải). Nếu mẫu không đạt, mình sẽ báo ngay.'],
  ['PA2 Thuê họa sĩ cho SS/SSS, boss, chân dung', 'Code làm cá B/A, quái thường, thuyền, đồ vật; họa sĩ làm 11 cá hiếm, boss Mareth, 4 chân dung NPC. Đẹp hơn ở chỗ quan trọng, nhưng cần người và thời gian.', 'Vừa (cho mình)', 'Cần họa sĩ; hình họa sĩ phải khớp phong cách và ô.'],
]));
c.push(table([20, 20, 40, 20], ['Nhóm', 'Số lượng', 'Trạng thái / animation', 'Cỡ ô đề xuất'], [
  ['Cá nhỏ (B, A nhỏ)', '~22 loài', 'idle 4 · bơi 6 · cắn câu 3 · giãy 4 · bị đánh 2 · chết 6 (khoảng 25 khung/loài)', '16×10 đến 32×20'],
  ['Cá vừa/lớn (A lớn, S)', '~14 loài', 'như trên + 2 tư thế đặc trưng', '36×18 đến 56×32'],
  ['Cá lớn (SS, SSS)', '11 loài', 'như trên + hiệu ứng riêng (ánh sáng, nước bắn)', '64×48 đến 112×56'],
  ['Đột biến', '3 bảng màu', 'đổi bảng màu + hạt lấp lánh', 'như loài gốc'],
  ['Quái biển', '10 quái + Reefjaw sheet hóa', 'idle 4-6 · bơi 6-8 · chuẩn bị 3-5 · tấn công 4-8 · bị đánh 2-3 (nháy trắng) · chết 8-12', '28×32 đến 96×20 (nhiều cỡ)'],
  ['Boss Mareth', '1 (ba pha)', 'idle · bơi · chuẩn bị · cắn · bầy cá · nuốt · bị đánh · chết 12 · chuyển pha 8', '160×112'],
  ['Thuyền và nâng cấp', 'thân + 7 lớp phụ', 'thân: idle/lướt/nứt/vỡ; pháo; động cơ (lửa); lưới; đèn pha; giáp', '80×40 (thân), 24×24 (phụ)'],
  ['Thú cưỡi', '5 con', 'idle 4 · bơi 6 · dash 4 · tấn công 4-6 · bị đánh 2 · chết 8 · có người cưỡi (mỗi tư thế đều có bản có người)', '48×32 đến 80×48'],
  ['Súng', '10 khẩu', 'biểu tượng 32×18 (đã có kiểu) + sheet bắn (3-6 khung) + hiệu ứng kỹ năng (sprite riêng cho hiệu ứng lớn)', '32×18 + hiệu ứng 64×64'],
  ['Kiếm', '5 thanh', 'biểu tượng + vung (có sẵn kiểu) + hiệu ứng kỹ năng', '26×26 + hiệu ứng 64×64'],
  ['NPC (cảng)', '≥ 4 người', 'dáng đứng + nói + chân dung 48×48 (có thể có vài biểu cảm)', '24×32; chân dung 48×48'],
  ['Môi trường', 'tập hợp ô + nền', 'ô cảng, đảo, phao hải đăng, rạn, xác tàu, hang xoáy, nền xa/gần cho 3 vùng, mặt nước nhiều lớp, 5 hiệu ứng thời tiết', '16×16 ô; nền 512×216'],
]));
c.push(P('Quy tắc sprite sheet đúng như bạn viết: các khung cùng cỡ ô, chân/tâm cố định, chừa 1-2 pixel đệm, nền trong suốt, tên theo quy ước (tên_idle, tên_swim, tên_attack, tên_hurt, tên_death...), kèm JSON (khung, ô, fps, neo), kiểm tra vòng lặp và cả hướng trái/phải, hitbox khớp thân. Mình có sẵn công cụ kiểm (verify.py, hitbox.py) từ Giai đoạn 3.'));

// ---------------- NPC ----------------
c.push(H2('NPC mới ở Cảng Neo (≥ 3, đề xuất 4)'));
c.push(table([14, 16, 36, 34], ['Tên', 'Vai', 'Tính cách và câu chuyện', 'Thoại mẫu (Việt / Anh)'], [
  ['Ông Neo / Old Anchor', 'Thợ rèn kiếm', 'Thủy thủ già cụt một tay, nói ít, nhớ tháp thứ tám bị nhấn chìm; rèn kiếm từ xương cá và mảnh neo. Nghiêm nhưng tử tế.', '"Kiếm không biết bơi. Cầm chắc nó, đừng làm nó chìm." / "A sword cannot swim. Hold it tight, do not let it sink."'],
  ['Cô Nòng / Little Barrel', 'Thợ súng', 'Cô bé 12 tuổi thiên tài, nói nhanh, nghiện thuốc nổ, tin rằng súng nào cũng có tính cách. Lúc nào cũng có vết muội.', '"Súng này tên là Sóng. Nó hay dỗi, nhưng bắn chuẩn lắm!" / "This one is called Wave. Moody, but it never misses!"'],
  ['Bác Vảy / Old Scale', 'Huấn luyện thú cưỡi', 'Người đàn ông nửa người cá, hiền, thở chậm, nói chuyện với thú như với bạn. Kể chuyện các thú biển từng giúp Người Giữ Đèn.', '"Chúng không phải để cưỡi. Chúng cho ta đi cùng." / "They are not for riding. They let you come along."'],
  ['Cảng trưởng Hải Đăng / Harbourmaster Beacon', 'Quản cảng, kho cá, nâng cấp thuyền, nhiệm vụ', 'Phụ nữ trung niên mặc áo choàng hải đăng; giữ sổ cá và kể về những ngọn hải đăng của các tháp; điều phối nâng cấp thuyền.', '"Mỗi con cá đều được ghi. Biển nhớ những gì lấy của nó." / "Every fish is logged. The sea remembers what is taken."'],
]));
c.push(P('Mỗi NPC có thoại thay đổi theo tiến trình (chưa đổi / đã mua / đã làm hết) và 1-2 câu liên quan đến Người Giữ Đèn, các tháp, Tàn Lửa Tháp. Tên bên trên không trùng tên NPC hiện có (Mira, Lila, Bram, Durin, Seraph, Gob...).'));

// ---------------- L. sound ----------------
c.push(H1('L. Âm thanh'));
c.push(optTable([
  ['PA1 ★ Tổng hợp bằng code như hiện có', 'Mọi âm thanh vẫn tổng hợp bằng Web Audio (không dùng mẫu thu sẵn, không rủi ro bản quyền). Mỗi vùng, ngày/đêm, thời tiết có nhạc và âm nền riêng trên bộ máy nhạc hiện có (thêm lớp đặc trưng như ở boss).', 'Lớn', 'Cần cân bằng âm lượng (có sẵn công cụ đo từ Giai đoạn 4).'],
  ['PA2 Dùng mẫu âm thanh ngoài', 'Thu/mua mẫu sóng, mưa, súng. Chất lượng thật hơn nhưng phát sinh bản quyền và dung lượng.', 'Vừa', 'Bản quyền; tăng dung lượng.'],
]));
c.push(table([24, 54, 22], ['Nhóm', 'Âm thanh', 'Ghi chú'], [
  ['Nhạc vùng', 'Cảng (ấm, hợp xướng nhẹ, đàn), V1 (phiêu lưu nhẹ), V2 (nhịp nhanh), V3 (trầm, kèn), Mareth (nhạc boss ba pha)', 'Dùng BOSS_TRACK/lớp đặc trưng có sẵn'],
  ['Ngày/đêm/thời tiết', 'Hải âu ban ngày, dế/đêm, mưa, sóng bão, sấm, sương mù yên lặng, trống thủy triều đỏ', 'Đổi mượt 3-5 giây'],
  ['Thuyền', 'Sóng vỗ mạn, mái chèo, động cơ phản lực, pháo, lưới kéo, vỡ thuyền, sửa thuyền', 'Có âm lượng nhỏ cho thuyền để không át tiếng câu'],
  ['Câu cá', 'Thả câu, dây căng, cá cắn, nước bắn, kéo cá, đứt dây, cá thoát, thẻ cá mới', 'Mỗi kiểu mini-game có tiếng riêng'],
  ['Quái và boss', 'Giọng từng quái (vây rẽ nước, sứa sạc điện, mực phun, mập húc, ma tàu), Mareth (ba pha)', 'Mở rộng bộ giọng boss hiện có'],
  ['Súng và kiếm', '10 tiếng súng khác nhau + hiệu ứng kỹ năng (quay thời gian, cuồng xạ, dừng thời gian, dịch chuyển, mưa đạn...); 5 kiếm', 'Mỗi kỹ năng một "dấu" âm thanh'],
  ['Thú cưỡi', 'Tiếng gọi, lên/xuống, bơi, dash, tấn công, bị đánh, chết', 'Mỗi con một giọng'],
]));

// ---------------- M. risks ----------------
c.push(H1('M. Rủi ro kỹ thuật và cách giảm'));
c.push(table([14, 40, 30], ['Mục', 'Rủi ro', 'Cách giảm / quyết định cần'], [
  ['Co-op', 'Thuyền, quái biển, kho cá, thú cưỡi, thời tiết, giờ: nhiều thứ phải đồng bộ; map rộng 720×96', 'Chủ phòng mô phỏng; chỉ gửi vật thể trong tầm 340 px; giờ/thời tiết gửi bằng 1 số; thú cưỡi và thuyền là vật thể đồng bộ như hiện có. Kho cá riêng từng người (lưu theo máy), không chia sẻ.'],
  ['Hiệu năng', 'Đàn cá, nhiều quái, nước và hiệu ứng thời tiết trên máy yếu', 'Ngân sách vật thể (tối đa ~40 con gần người chơi), cắt theo tầm nhìn, sprite sheet nạp theo vùng, hiệu ứng thời tiết ít lớp; đo trước/sau ở từng bước.'],
  ['Lưu game', 'Thêm trường mới: kho cá (đếm theo loài), kỹ năng câu, nâng cấp thuyền, đồ đã đổi, mồi, ngọc, sưu tầm', 'Chỉ thêm trường tùy chọn có mặc định; file cũ nạp bình thường; chỉ ghi khi dỡ cá/đổi đồ (chống cày bằng lưu/nạp).'],
  ['Cân bằng', 'Đồ mới mạnh hơn đồ hiện có cùng hạng, hoặc làm boss cũ quá dễ', 'Cân theo bảng hạng hiện có (đã đo), thử trên boss; kỹ năng tác động boss bị giảm (choáng/đóng băng/dừng thời gian).'],
  ['Đã tồn tại', 'Phần câu cá/thuyền/Reefjaw của Giai đoạn 5 hiện vẽ bằng code lúc chạy, phần thưởng cá hiện cho vật phẩm ngay (xu, đạn, tim)', 'Bước 1-2 chuyển sang kho cá và sprite sheet; phần thưởng tức thời đổi thành "ăn cá" và xu bán cá.'],
  ['Nút mới', 'Nút V cho thú cưỡi', 'Cập nhật màn hướng dẫn nút; tay cầm: giữ Y; cảm ứng: nút mới.'],
]));

// ---------------- N. order ----------------
c.push(H1('N. Thứ tự làm và những câu hỏi mở'));
['1. Nền tảng: map Biển Khơi, thuyền (từ bản hiện có), kho cá, lưu game.', '2. Câu cá 3 kiểu, mồi, kỹ năng câu.', '3. Danh mục 45 cá: mẫu 2 loài trước, rồi từng nhóm.', '4. Cảng, 4 NPC, quầy đổi cá (khung đổi, chưa đủ đồ).', '5. 5 kiếm.', '6. 10 súng.', '7. 5 thú cưỡi (mẫu 1 con trước).', '8. Quái biển, boss Mareth, Ngọc Trai Quý.', '9. Nâng cấp thuyền.', '10. Ngày/đêm, thời tiết, sự kiện.', '11. Cân bằng, tối ưu, kiểm tra toàn bộ (6.3).'].forEach(t => c.push(BL(t)));
c.push(H2('Những điều mình cần bạn chốt (mặc định là ★)'));
[
  'Map mới "Biển Khơi" (PA1) hay mở rộng map cũ (PA2)?',
  'Giữ giá 12.600 con và tăng sản lượng (PA1) hay chia đôi giá (PA2)?',
  'Cá đột biến/huyền thoại vẫn tính 1 con khi đổi (mặc định) hay tính nhiều hơn?',
  'Thú cưỡi chỉ ở biển (PA1) hay mọi nơi (PA2, mình không khuyên)?',
  'Nút lên/xuống thú: V / giữ Y / nút cảm ứng, đồng ý chứ?',
  'Kho cá riêng từng người chơi (mặc định) hay kho chung của đội?',
  'Vẽ bằng bộ công cụ pixel với mẫu duyệt (PA1) hay có họa sĩ cho cá SS/SSS, Mareth, chân dung (PA2)?',
  'Mareth là boss mới ở Biển Khơi, còn Oktavor ở map cũ giữ nguyên: đồng ý chứ?',
].forEach(t => c.push(BL(t)));

const doc = new Document({
  numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: 'bullet', text: '•', style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
  styles: { default: { document: { run: { font: 'Arial' } } } },
  sections: [{ properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 16838, height: 11906 }, margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, children: c.filter(Boolean) }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('D:/Game/De_xuat_dai_duong_GD6.docx', b); console.log('ok', b.length); });
