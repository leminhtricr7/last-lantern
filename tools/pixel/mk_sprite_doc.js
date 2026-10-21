// Builds D:\Game\De_xuat_sprite_GD3A.docx: phase 3A sprite descriptions for every character + the two samples.
const d = require('docx'), fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, HeadingLevel, BorderStyle, AlignmentType, PageOrientation, ImageRun } = d;
const W = 15038, B = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' }, BS = { top: B, bottom: B, left: B, right: B };
const run = (t, o) => new TextRun(Object.assign({ text: t, size: 17 }, o || {}));
const cell = (w, t, o) => new TableCell(Object.assign({ width: { size: w, type: WidthType.DXA }, borders: BS, margins: { top: 50, bottom: 50, left: 80, right: 80 }, children: [new Paragraph({ children: [run(t, (o && o.r) || {})] })] }, o && o.fill ? { shading: { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } } : {}));
const COLS = [2100, 6338, 1100, 3600, 1900];
const table = rows => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: COLS, rows: [new TableRow({ tableHeader: true, children: ['Nhân vật', 'Mô tả sprite (dáng · màu chủ đạo · mắt/nanh/sừng · vũ khí · hiệu ứng)', 'Cỡ ô', 'Animation (số khung)', 'Cách làm'].map((h, i) => cell(COLS[i], h, { fill: 'E8DDB5', r: { bold: true } })) })]
  .concat(rows.map(r => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(COLS[i], t, i === 0 ? { r: { bold: true } } : (i === 4 ? { fill: t === ART ? 'FBE3DC' : (t === MIX ? 'FFF3C4' : 'E3F2DF') } : {}))) }))) });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 100 }, children: [new TextRun(t)] });
const P = t => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: t, size: 20 })] });
const BL = (t, b) => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 40 }, children: b ? [new TextRun({ text: b, bold: true, size: 20 }), new TextRun({ text: t, size: 20 })] : [new TextRun({ text: t, size: 20 })] });
const img = (path, w, h) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: fs.readFileSync(path), transformation: { width: w, height: h } })] });

const WALK = 'idle 6 · đi 8 · báo chiêu 4 · đập 6 · phép/bắn 6 · bị đánh 3 · chết 10 · nổi điên 6 · xuất hiện 6';
const FLY = 'idle 6 · bay 6 · báo chiêu 4 · tấn công 6 · bị đánh 3 · chết 8–10 · nổi điên 6 · xuất hiện 6';
const SUM = 'idle 6 · đi/bay 6–8 · báo chiêu 4 · tấn công 6 · bị đánh 3 · chết 8 · xuất hiện 6 · tiến hóa 8';
const CODE = 'Vẽ bằng code (như mẫu Kaldrok)', ART = 'Nên nhờ họa sĩ (chi tiết mềm: mặt, vải, lông, tóc)', MIX = 'Code được; họa sĩ đẹp hơn';
const A = [
 ['Gulgor · Bụng Nuốt Đèn (map 1)', 'Khối nhầy xanh rêu trong mờ, bụng phình chứa những đốm sáng bị nuốt (vàng nhạt); vương miện đá sứt mẻ; miệng rộng kéo ngang thân với răng nhầy; mắt nhỏ đỏ. Nhảy thì dẹt rồi bung. Bóng: giọt nước to đội mũ.', '64×64', WALK.replace('đi 8', 'nảy 8'), CODE],
 ['Veylith · Kẻ Dệt Lời Thì Thầm (map 2)', 'Nhện chúa thân tím than, lưng có hoa văn hình mặt người nhợt (lời thì thầm), 8 chân dài gầy gập góc, 6 mắt xanh lục phát sáng, nanh cong; tơ bạc vắt từ bụng. Bóng: chân xòe như bàn tay.', '72×64', WALK.replace('đi 8', 'bò 8'), CODE],
 ['Prismor · Trái Tim Pha Lê Câm (map 3)', 'Khổng lồ đá xám xanh, lưng mọc cụm pha lê tím/xanh lam, ngực là trái tim pha lê bị nhốt ánh sáng (đập theo nhịp), mặt không miệng chỉ có 2 khe mắt trắng. Tay phải là khối pha lê nhọn. Bóng: vai lệch, lưng nhọn.', '72×80', WALK, CODE],
 ['Khepsar · Kẻ Xin Được Ngủ (map 4)', 'Pharaoh xác ướp gầy cao, mũ nemes vàng sọc lam đã bạc, băng vải ngà rách lộ cát chảy ra; mắt ngủ khép hờ với ánh vàng; tay cầm quyền trượng đầu bọ hung; xung quanh có cát xoáy. Bóng: mũ nemes rộng hai bên.', '64×88', WALK, ART],
 ['Rimvald · Trái Tim Tự Đóng Băng (map 5)', 'Vua băng cao gầy, áo choàng lam đậm phủ sương, vương miện băng nhọn, ngực có trái tim băng nứt phát sáng xanh trắng; râu băng nhũ; cầm trượng băng. Hơi lạnh tỏa ra. Bóng: vương miện tua nhọn + áo choàng loe.', '80×88', WALK, MIX],
 ['Kaldrok · Lò Rèn Biết Đi (map 6)', 'MẪU ĐÃ LÀM. Khổng lồ bazan gù, phiến đá nâu đen nứt dung nham, lò lửa trong ngực có song sắt, hai nắm đấm như đe rèn, sừng ngà cong, mắt vàng (nổi điên: đỏ), hai ống khói sau lưng phun khói và tàn lửa.', '96×96', 'idle 6 · đi 8 · báo chiêu 4 · đập 6 · gầm/lò 6 · bị đánh 3 · chết 10 · nổi điên 6 (49 khung)', CODE],
 ['Morvella · Lời Ru Của Đầm Lầy (map 7)', 'Mẹ nấm khổng lồ: mũ nấm tím đốm sáng xanh lục, dưới mũ là khuôn mặt hiền mà rợn với mắt nhắm, tay là rễ cây, váy bằng phiến nấm; bào tử phát sáng bay quanh. Trôi chậm. Bóng: mũ nấm rộng, thân mảnh.', '112×112', FLY.replace('bay 6', 'trôi 6'), ART],
 ['Oktavor · Kẻ Nhấn Chìm Tháp Thứ Tám (map 8)', 'Bạch tuộc khổng lồ tím đỏ thẫm, đầu có vết sẹo mỏ neo, mắt vàng con ngươi ngang, mỏ đen; 8 xúc tu có giác hút sáng; quấn xích và mảnh tháp chìm. Bơi dưới nước. Bóng: đầu tròn + xúc tu tỏa.', '128×128', FLY.replace('bay 6', 'bơi 8'), ART],
 ['Vorgrub · Miệng Nuốt Tàn Lửa (map 9)', 'Sâu khổng lồ đốt nâu đất, miệng tròn nhiều vòng răng, bên trong cháy đỏ tàn lửa đã nuốt; gai xương dọc lưng; đất đá bám. Chui đất / trồi lên. Bóng: thân cong chữ S, miệng mở to.', '112×128', 'idle 6 · trườn 8 · chui xuống 6 · trồi lên 6 · cắn/phun 6 · bị đánh 3 · chết 10 · nổi điên 6', MIX],
];
const Bq = [
 ['Quốc · Người Giữ Đèn Sa Ngã (dạng 1)', 'Chàng trai giáp đen gai, áo choàng rách, vương miện xương, đèn lồng nứt treo hông (ánh đỏ), mắt đỏ. Vẫn ra dáng người.', '64×88', WALK + ' · biến hình 8', ART],
 ['Bóng Cô Đơn (dạng 2)', 'Tiểu quỷ bóng đen nhỏ như đứa trẻ, ôm gối, mắt to buồn, sừng nhỏ; khi đánh thì vươn tay bóng dài.', '56×56', WALK + ' · biến hình 8', MIX],
 ['Chó Săn Không Chủ (dạng 3)', 'Chó săn gầy đen, xích đứt ở cổ, bờm lửa đỏ, mắt đỏ, nanh dài; chạy bốn chân.', '96×64', WALK.replace('đi 8', 'chạy 8') + ' · biến hình 8', CODE],
 ['Kẻ Mang Xích Lời Thề (dạng 4)', 'Quỷ to cơ bắp, xích sắt quấn người khắc chữ lời thề phát sáng, quả tạ xích làm vũ khí.', '88×88', WALK + ' · biến hình 8', CODE],
 ['Hiệp Sĩ Hết Hơi Ấm (dạng 5)', 'Bộ giáp rỗng cao lớn, khe mũ trống chỉ có gió lạnh xanh, kiếm lớn, áo choàng bạc màu; sương lạnh rơi từ khe giáp.', '80×96', WALK + ' · biến hình 8', CODE],
 ['Đôi Cánh Lỡ Đỉnh (dạng 6)', 'Đại quỷ cánh dơi rách ở đầu cánh, sừng cong, bay nghiêng như kiệt sức; lông vũ đen rơi.', '112×96', FLY + ' · biến hình 8', ART],
 ['Tro Tàn Chín Ngọn Tháp (dạng 7)', 'Khổng lồ tro than, chín ngọn lửa nhỏ cháy trên vai và lưng (chín tháp), thân nứt đỏ, tàn tro bay.', '112×128', WALK + ' · biến hình 8', MIX],
 ['TRÁI TIM NHẬT THỰC (dạng 8)', 'Hình người bóng tối khổng lồ lơ lửng, ngực là vầng nhật thực đen viền lửa tím, tóc như vành nhật hoa, mắt trắng; chiếc đèn cũ le lói trong tay. Lớn nhất game.', '128×144', FLY + ' · biến hình 8 · chết 12 (đặc biệt)', ART],
];
const C = [
 ['Ngài Shorty Phong · Quản Gia Mũ Cao', 'Quý ông thấp, mũ chóp cao tím, kính một mắt, ria cong, gậy đầu vàng, áo đuôi tôm. Hài hước mà có chút đáng thương.', '48×64', WALK + ' · biến hình 8', CODE],
 ['Shorty Phong, Quỷ Mũ Cao', 'Chiếc mũ cao nuốt ông: thân quỷ tím, miệng răng cưa cười toác ngang mũ, tay dài cầm lưỡi hái, kính một mắt vẫn còn.', '80×96', WALK, CODE],
 ['Thầy Sy · Nhà Pha Độc Áo Xanh', 'Nhà giả kim áo khoác xanh rêu dài, mũ rộng vành, mặt nạ mỏ chim, đeo đầy lọ thuốc độc phát sáng xanh lục, gậy có đèn độc.', '48×72', WALK + ' · biến hình 8', MIX],
 ['Sy, Mãng Xà Độc Dược', 'Mãng xà xanh lục khổng lồ quấn cổng thành, mũ rộng vành còn trên đầu, nọc nhỏ giọt, các lọ thuốc vỡ cắm trên vảy.', '112×96', 'idle 6 · trườn 8 · báo chiêu 4 · phun độc 6 · cắn 6 · bị đánh 3 · chết 10 · nổi điên 6', MIX],
];
const D = [
 ['Ignar · Rồng Con Lạc Đàn (map 1)', 'Rồng con cam vàng, đầu to, cánh nhỏ vỗ nhanh, vảy bụng vàng, sừng ngắn, mắt vàng kiêu ngạo; phun lửa nhỏ.', '80×64', FLY + ' · bỏ chạy 6', CODE],
 ['Ignarok Vảy Tro (dạng 1)', 'Rồng đỏ trưởng thành, vảy tro đen viền đỏ, cánh màng đỏ sẫm, sừng ngà, lửa trong họng.', '128×96', FLY + ' · đáp đất 6', MIX],
 ['Ignarok Ba Đầu Thịnh Nộ (dạng 2)', 'Ba đầu trên ba cổ dài, mỗi đầu một màu lửa (cam, đỏ, vàng), cánh to hơn, gai lưng.', '144×112', FLY + ' · biến hình 8', ART],
 ['Ignarok Cánh Đêm (dạng 3)', 'Rồng bóng tối tím đen, cánh như màn đêm có lỗ thủng sao, mắt hồng tím, hơi thở lửa tím; khói đen quanh thân.', '128×96', FLY + ' · tàng hình 6 · biến hình 8', MIX],
];
const E = [
 ['Khổng Lồ Mạch Đất', 'Khổng lồ đá rêu, mạch đất phát sáng xanh lá chạy khắp thân, búa đá; dậm đất nứt.', '88×96', SUM, CODE],
 ['Chúa Sấm Rền', 'Lão thần mây xám, râu trắng bay, sừng tia chớp, gậy sét; tia điện chạy quanh.', '80×96', SUM, MIX],
 ['Nàng Triều Dâng', 'Thiếu nữ biển tóc như sóng xanh ngọc, váy bọt nước, cây đinh ba san hô; bọt và nước bắn.', '80×96', SUM, ART],
 ['Phượng Hoàng Hồi Sinh', 'MẪU ĐÃ LÀM. Chim lửa: thân đỏ thẫm, cánh cháy đỏ sang vàng ở đầu lông, mào 3 ngọn lửa, đuôi 3 dải lửa, tàn lửa quanh; chết hóa tro rồi vỡ vụn.', '80×80', 'idle 6 · bay 6 · báo chiêu 4 · tấn công 6 · bị đánh 3 · chết 8 · xuất hiện 6 · tiến hóa 8 (47 khung)', MIX],
 ['Nàng Trăng Bạc', 'Nữ cung thủ áo tím than, tóc bạc dài, vầng trăng khuyết sau lưng, cung trăng; tia trăng trắng xanh.', '80×96', SUM, ART],
 ['Rồng Vàng Cổ Đại', 'Rồng vàng già, râu rồng, vảy ánh kim, cánh rộng; phun lửa vàng vào boss.', '112×96', SUM, MIX],
 ['Khổng Lồ Băng Hà', 'Khổng lồ băng xanh lam, nanh băng chĩa ra từ hàm, búa băng, sương tuyết; đóng băng đất.', '88×96', SUM, CODE],
 ['Hoàng Đế Mặt Trời Xưa', 'Hoàng đế áo đỏ vàng, vương miện tia nắng, quyền trượng mặt trời đã nguội (ánh nhạt), bắn tia nắng lớn. Theo bản thiết kế bạn đã gửi, vẽ lại thành pixel.', '80×96', SUM, ART],
 ['Tướng Quân Vô Ảnh', 'Võ tướng giáp đen viền đỏ, mũ kabuto, katana dài, dưới chân KHÔNG có bóng (điểm nhận dạng); nhát chém ngang màn hình.', '80×96', SUM, MIX],
 ['Ông Cây Rễ Cổ', 'Cây già biết đi, mặt khắc trên thân, mắt xanh lục, rễ như chân, cành như tay; rễ trồi lên trói địch.', '96×104', SUM, CODE],
];
const F = [
 ['Hộ Vệ Rạng Đông', 'Hiệp sĩ giáp vàng sáng, khiên tròn lớn hình mặt trời mọc, áo choàng trắng; vòm sáng chắn đạn.', '80×96', SUM, MIX],
 ['Chiến Nữ Giáo Sao', 'Nữ chiến binh cánh trắng, mũ có cánh, giáo đầu ngôi sao; ném giáo ánh sáng.', '80×96', SUM, ART],
 ['Ba Bóng Vọng', 'Ba bản bóng đen tím của chính nhân vật đang chơi, mắt trắng; dùng lại khung của nhân vật + lớp màu bóng.', 'theo nhân vật', 'idle 4 · chạy 6 · đánh 6 · tan biến 6', CODE],
 ['Sứ Giả Hào Quang', 'Sứ giả cánh trắng, vòng hào quang vàng, áo trắng, kiếm sáng; hồi máu (vòng sáng xanh lá).', '80×96', SUM, ART],
 ['Cặp Đá Canh Cổng', 'Hai người đá thấp đậm như hai trụ cổng, khắc rune xanh lá, nắm đấm to; đứng hai bên rồi đấm.', '64×64 (mỗi con)', SUM, CODE],
];
const G = [
 ['Rồng Than Hồng → Rồng Lửa Than Hồng', 'Con: rồng nhỏ đen than với vết nứt đỏ. Lớn: rồng than to, lưng như than hồng, khói và tàn lửa.', '24×24 → 96×80', 'Con: idle 4 · đi 6 · phun 4. Lớn: ' + SUM, CODE],
 ['Kỳ Lân Con → Kỳ Lân Tia Chớp', 'Con: kỳ lân non xanh lam, sừng vàng. Lớn: kỳ lân có bờm tia chớp, móng sét.', '24×24 → 96×80', 'như trên', MIX],
 ['Đá Cuội Tí Hon → Khổng Lồ Đá Cuội', 'Con: hòn cuội tròn có mắt. Lớn: khổng lồ ghép từ cuội tròn, hiền và chắc (khác hẳn Khổng Lồ Mạch Đất).', '24×24 → 88×88', 'như trên', CODE],
 ['Cá Voi Sao → Cá Voi Ánh Sáng', 'Con: cá voi xanh nhỏ có đốm sao. Lớn: cá voi ánh sáng trong suốt như trong phim map 8, sao chổi rơi.', '24×24 → 128×64', 'như trên', CODE],
 ['Cáo Lửa Xanh Con → Hồ Ly Lửa Xanh', 'Con: cáo con trắng, đuôi có lửa xanh. Lớn: hồ ly trắng nhiều đuôi lửa xanh lam.', '24×24 → 96×80', 'như trên', MIX],
];
const Hs = [
 ['Bảy Nốt Nhạc Của Lyra', 'ĐÃ LÀM: nốt nhạc pha lê, 7 màu đỏ → tím, viền đậm, quầng sáng cùng màu.', '12×16', 'đứng 1 (lơ lửng bằng code)', CODE],
 ['Hạc Ánh Sáng', 'ĐÃ LÀM (bản tạm): hạc trắng mào đỏ, chân và mỏ vàng, vệt sáng phía sau. Nên làm thêm 4–6 khung vỗ cánh mượt.', '40×30', 'bay 2 (tạm) → nên 6', CODE],
];

const doc = new Document({
  numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: d.LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] }] },
  styles: { default: { document: { run: { font: 'Arial', size: 20 } } }, paragraphStyles: [{ id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, font: 'Arial', color: '7A5A10' }, paragraph: { outlineLevel: 0 } }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'LAST LANTERN', bold: true, size: 40, color: '7A5A10' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Giai đoạn 3A: mô tả sprite và 2 mẫu (chờ duyệt)', size: 26 })] }),
      H1('1. Quy chuẩn chung'),
      BL(' pixel art 16-bit, nét sắc, viền ngoài 1 px đậm, đổ bóng khối 3–4 tông với một nguồn sáng từ trên-trái, tối đa 16 màu mỗi nhân vật, 1–2 màu phát sáng (mắt, lõi năng lượng).', 'Phong cách:'),
      BL(' mỗi trạng thái là một file PNG dải ngang (tên_idle.png, tên_walk.png...), mọi khung cùng cỡ ô, nền trong suốt tuyệt đối, nhìn sang phải; kèm tên.json ghi cỡ ô, số khung, fps, điểm neo (chân giữa đáy ô; nhân vật bay: tâm thân). Lật trái/phải quanh điểm neo.', 'Sprite sheet:'),
      BL(' bộ công cụ tools/pixel tự kiểm: lưới, nền trong suốt, số màu, đệm mép ô, chân đứng yên trên hàng neo, vòng lặp nối liền. Kết quả kiểm của 2 mẫu ở docs/sprites_3A/checks.txt.', 'Kiểm tra tự động:'),
      BL(' kích thước tăng theo độ mạnh: boss map 1 khoảng 64 px, Kaldrok 96 px, Oktavor 128 px, dạng cuối của Quốc lớn nhất (128×144). Nhân vật chính cao khoảng 22 px.', 'Cỡ:'),
      H1('2. Hai mẫu'),
      P('Ảnh dưới: so sánh ở đúng cỡ trong game (nhân vật chính, Kaldrok cũ/mới, Phượng Hoàng cũ/mới). Bộ khung đầy đủ và ảnh động GIF ở thư mục docs/sprites_3A.'),
      img('D:/Game/docs/sprites_3A/compare_in_game_scale.png', 900, 178),
      BL(' 8 trạng thái, 49 khung, ô 96×96, 14 màu. Đứng thở (lò ngực đập nhịp, khói lưng), đi nặng nề không trượt chân, báo chiêu giơ hai nắm đấm qua đầu, đập đất có tia lửa, gầm lò lửa, bị đánh có khung nháy trắng, chết vỡ thành đá và vũng dung nham nguội, nổi điên (dung nham trắng, mắt đỏ).', 'Kaldrok:'),
      BL(' 8 trạng thái, 47 khung, ô 80×80, 11 màu. Vỗ cánh lơ lửng, bay lượn, báo chiêu giương cánh, vỗ cánh xuống ném cầu lửa, bị đánh, chết hóa tro rồi vỡ vụn, xuất hiện từ quả cầu lửa, tiến hóa.', 'Phượng Hoàng Hồi Sinh:'),
      BL(' Kaldrok mới rõ ràng hơn bản cũ về độ ngầu, đáng sợ và đồng bộ. Phượng Hoàng mới đồng bộ phong cách nhưng ở cỡ nhỏ kém chi tiết và kém uy nghi hơn bản tranh cũ: lông vũ, khuôn mặt, vải là điểm yếu của cách vẽ bằng code. Vì vậy bảng dưới ghi rõ nhân vật nào nên nhờ họa sĩ.', 'Đánh giá thẳng:'),
      img('D:/Game/docs/sprites_3A/kaldrok_sheet_small.png', 886, 700),
      img('D:/Game/docs/sprites_3A/phoenix_sheet_small.png', 716, 700),
      H1('3. Mô tả từng nhân vật'), P('Màu nền cột cuối: xanh = làm được bằng code như mẫu; vàng = code được nhưng họa sĩ sẽ đẹp hơn; hồng = nên nhờ họa sĩ pixel (hoặc dùng Aseprite) để đạt mức bán được.'),
      new Paragraph({ children: [new TextRun({ text: 'A. Boss chính', bold: true, size: 22 })] }), table(A),
      new Paragraph({ children: [new TextRun({ text: 'B. Tám dạng của Quốc', bold: true, size: 22 })] }), table(Bq),
      new Paragraph({ children: [new TextRun({ text: 'C. Boss phụ', bold: true, size: 22 })] }), table(C),
      new Paragraph({ children: [new TextRun({ text: 'D. Rồng', bold: true, size: 22 })] }), table(D),
      new Paragraph({ children: [new TextRun({ text: 'E. Triệu hồi từ kiếm', bold: true, size: 22 })] }), table(E),
      new Paragraph({ children: [new TextRun({ text: 'F. Triệu hồi từ giáp', bold: true, size: 22 })] }), table(F),
      new Paragraph({ children: [new TextRun({ text: 'G. Thú cưng và dạng lớn', bold: true, size: 22 })] }), table(G),
      new Paragraph({ children: [new TextRun({ text: 'H. Bí mật', bold: true, size: 22 })] }), table(Hs),
      H1('4. Việc còn lại cho 3B'),
      BL('Viết bộ đọc sprite sheet chung cho boss (hiện boss map 1–9, Shorty, Sy, rồng chỉ đọc 1 hình) và cho drawBoss chọn khung theo trạng thái; hitbox lấy theo phần thân nhìn thấy.'),
      BL('Làm hàng loạt theo nhóm (boss chính → Quốc và boss phụ → rồng → triệu hồi và thú cưng), mỗi nhóm một commit kèm báo cáo kiểm tra.'),
      BL('Với các nhân vật ghi "nên nhờ họa sĩ": mình có thể làm bản bằng code trước để game đồng bộ ngay, rồi thay bằng bản của họa sĩ sau (cùng định dạng file, không phải sửa code).'),
    ]
  }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('D:/Game/De_xuat_sprite_GD3A.docx', b); console.log('ok'); });
