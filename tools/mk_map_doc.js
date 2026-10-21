// Builds D:\Game\De_xuat_map_GD5.docx: phase 5.0 inventory of the 10 maps + phase 5.1 proposal (two options per
// feature, the recommended one marked), for the user to approve before anything is built.
const d = require('docx'), fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, HeadingLevel, BorderStyle, PageOrientation } = d;
const W = 15038, B = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' }, BS = { top: B, bottom: B, left: B, right: B };
const run = (t, o) => new TextRun(Object.assign({ text: t, size: 16 }, o || {}));
const cell = (w, t, o) => new TableCell(Object.assign({ width: { size: w, type: WidthType.DXA }, borders: BS, margins: { top: 40, bottom: 40, left: 70, right: 70 }, children: [new Paragraph({ children: [run(t, (o && o.r) || {})] })] }, o && o.fill ? { shading: { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } } : {}));
const table = (cols, head, rows, mark) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cols, rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(cols[i], h, { fill: 'E8DDB5', r: { bold: true } })) })]
  .concat(rows.map(r => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(cols[i], t, i === 0 ? { r: { bold: true }, fill: mark && String(r[0]).indexOf('★') >= 0 ? 'E3F2DF' : undefined } : {})) }))) });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 100 }, children: [new TextRun(t)] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 }, children: [new TextRun(t)] });
const P = t => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: t, size: 20 })] });
const BL = (t, b) => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 40 }, children: b ? [new TextRun({ text: b, bold: true, size: 20 }), new TextRun({ text: t, size: 20 })] : [new TextRun({ text: t, size: 20 })] });

// ---------- 5.0 inventory ----------
const MAPS = [   // play order; numbers measured with genLevel() in the browser on 2026-10-21
 ['1 · Đồng Cỏ Xanh', '400', '9', '3', '3', '3 · 4 · 1', '2 cổng', '2', 'không', 'Ngày-đêm, cắt cỏ, bình, bụi che lối'],
 ['2 · Rừng Thì Thầm', '440', '10', '5', '2', '3 · 4 · 1', '3 cổng', '2', 'không', 'Ngày-đêm, cắt cỏ, bình, bụi che lối'],
 ['3 · Hang Pha Lê', '600', '13', '5', '2', '3 · 4 · 1', '3 cổng, 1 tường bom', '3', 'không', 'Bình pha lê, gạch lạ, thùng đẩy (không ngày-đêm)'],
 ['4 · Sa Mạc Cháy Nắng', '670', '14', '6', '2', '3 · 4 · 1', '2 cổng, 1 tường bom', '3', 'không', 'Ngày-đêm, bình gốm, bụi khô, thùng'],
 ['5 · Đỉnh Băng Giá', '740', '14', '4', '3', '3 · 4 · 1', '3 cổng', '4', 'không (có băng trơn)', 'Ngày-đêm, bình băng, thùng trượt trên băng'],
 ['6 · Núi Lửa Tro Tàn', '810', '19', '4', '3', '3 · 4 · 1', '4 cổng, 1 tường bom', '4', 'dung nham', 'Hũ đá, tường nứt (không ngày-đêm)'],
 ['7 · Đầm Lầy Nấm', '830', '20', '5', '2', '3 · 4 · 1', '4 cổng, 1 tường bom, 5 dây leo', '5', 'không (đầm khô)', 'Ngày-đêm, cắt cỏ, hũ nấm, có thể thêm ao để câu cá'],
 ['8 · Đại Dương Sâu Thẳm', '84×132 (dọc)', '7', '6', '6 hốc bên tường', '0 · 4 · 1 + 3 ngọc trai', 'cửa thủy triều', '0', 'CÓ (cả map)', 'Câu cá trên bờ (có sẵn Ông Tư Đánh Cá), bình'],
 ['9 · Đường Hầm Sâu', '900', '19', '5', '3', '3 · 4 · 1', '3 cổng, 2 tường bom', '4', 'hồ ngầm ở trận boss', 'Thùng gỗ hầm mỏ, gạch lạ (không ngày-đêm)'],
 ['10 · Thành Trì Bóng Tối', '1100', '26', '8', '3', '3 · 4 · 1', '8 cổng', '6', 'không', 'Bình đồng, gạch lạ, tường nứt (luôn là đêm)'],
];
const CHECK = [
 ['Chu kỳ ngày đêm', 'CHƯA CÓ', 'Không có biến thời gian trong ngày. Mặt trời chỉ sáng dần theo số map đã qua: game.js:79 sunPower() = save.cleared.length / 7; vẽ trời game.js:3639.'],
 ['Cắt cỏ/bụi ra xu', 'CHƯA CÓ', 'Cỏ chỉ là trang trí vẽ theo ô (scenery.js:165 FG_KIND, game.js:6764); đòn chém không tác động lên chúng.'],
 ['Thùng đẩy được', 'CHƯA CÓ', '"crate" chỉ là đồ trang trí nền (scenery.js:78, 94). Có sẵn tư thế "đẩy tường" (game.js:5523, art.js:62) dùng lại được.'],
 ['Đập bình/chum', 'CHƯA CÓ', 'Không có vật thể nào tên pot/jar/vase/urn; "barrel" chỉ là trang trí hầm mỏ (scenery.js:94).'],
 ['Câu cá', 'CHƯA CÓ', 'Chỉ có NPC Ông Tư Đánh Cá nói chuyện (game.js:6630) và cá bơi trên nền trời (game.js:6734).'],
 ['Dịch chuyển nhanh', 'CHƯA CÓ', 'Checkpoint chỉ dùng để hồi sinh (levels.js flat(..., cp:true)); không có lệnh dịch chuyển.'],
 ['Chọn lại map đã qua', 'ĐÃ CÓ', 'Màn bản đồ cho chọn mọi map đã mở: game.js:78 maxPlayable(), 638, 4870. Không làm lại; chỉ có thể nâng cấp (xem F).'],
 ['Khóa-chìa theo kỹ năng', 'CHƯA CÓ', 'Cổng hiện chỉ mở bằng cần gạt, chìa, đuốc, hẹn giờ, chữ rune (levels.js:317-396), không cổng nào đòi lướt/nhảy đôi.'],
 ['Nhiệm vụ phụ có chiều sâu', 'CHƯA CÓ', 'Thoại NPC cố định theo map, không đổi theo tiến trình (game.js:2515 startTalk). Nhiệm vụ duy nhất là 3 ngọc trai ở Đại Dương (game.js:7437), nằm trên đường chính.'],
 ['Bước chân theo loại nền', 'CHƯA CÓ', 'Bước chân chỉ theo MAP, không theo ô dưới chân: game.js:1556 Snd.step(Q.B.id); audio.js:336 foot(kind).'],
];

// ---------- 5.1 proposals: [option, maps, how, reward, difficulty/balance, effort, risk] ----------
const COLS = [1500, 1700, 4338, 2000, 2100, 1100, 2300];
const HEAD = ['Phương án', 'Map áp dụng', 'Cách hoạt động', 'Phần thưởng', 'Độ khó / cân bằng', 'Công sức', 'Rủi ro'];
const F = {
 A1: ['A1 · Cắt cỏ / bụi cây', [
  ['PA1 ★ Bụi riêng', 'Đồng Cỏ, Rừng, Sa Mạc (bụi khô), Đỉnh Băng (bụi tuyết), Đầm Lầy', 'Bộ sinh map đặt bụi/cỏ cao thành vật thể riêng trên nền (khoảng 1 bụi mỗi 12-20 ô, tránh checkpoint, cổng, đoạn bẫy). Một nhát chém (kiếm, dao, bom, lửa) là đứt: lá bay đúng màu map, tiếng "xoạt" riêng. Không mọc lại trong lượt chơi.', 'Xu 25% (1 xu), dao găm 8%, tim nhỏ 4% (chỉ khi thiếu máu). Tối đa ~30 xu/map.', 'Không đổi: phần thưởng nhỏ, có trần. Không che quái hay gai.', 'Vừa', 'Ít. Đồng bộ co-op qua danh sách vật thể của chủ phòng.'],
  ['PA2 Mọi ngọn cỏ', 'Như trên', 'Mọi ngọn cỏ trang trí trên nền đều chém được, rơi đồ ít hơn (5%).', 'Như trên, ít hơn', 'Như trên', 'Lớn', 'Hiệu năng: hàng nghìn ngọn cỏ phải kiểm tra va chạm; khó đồng bộ.']]],
 A2: ['A2 · Thùng gỗ đẩy được', [
  ['PA1 ★ Phòng thùng riêng', 'Hang, Sa Mạc, Đỉnh Băng (thùng trượt trên băng), Đường Hầm, Thành Trì', 'Mỗi map 1-2 "phòng thùng" sinh riêng, KHÔNG nằm trên đường chính: đẩy thùng lên bàn đạp để mở cửa phụ, hoặc làm bậc để lên kệ cao có rương. Đẩy bằng cách đi vào thùng (dùng lại tư thế đẩy tường). Luôn có cột đặt lại: chạm vào là thùng về chỗ cũ; ra khỏi phòng thùng cũng tự về.', 'Rương: xu, đạn, đôi khi Ngọc Sao của khu bí mật.', 'Không đổi đường chính; chỉ thêm đường phụ.', 'Lớn', 'Kẹt thùng (đã có cột đặt lại). Co-op: thùng do chủ phòng mô phỏng.'],
  ['PA2 Thùng trên đường chính', 'Như trên', 'Thùng rải trên đường chính để chặn gai, làm bậc.', 'Lối tắt', 'Có thể làm map dễ hoặc khó bất ngờ', 'Lớn', 'Cao: dễ làm người chơi mắc kẹt, khó kiểm tra với map sinh theo công thức.']]],
 A3: ['A3 · Bình, chum, thùng bể được', [
  ['PA1 ★ Bình theo chủ đề', 'Cả 10 map (Đại Dương: chum san hô)', 'Mỗi map 6-12 vật bể được, hình theo chủ đề (chum đất, bình gốm, bình băng, hũ nấm, bình pha lê, hũ đá, thùng hầm mỏ, bình đồng). Đặt gần checkpoint, cuối đoạn khó và trong khu bí mật. Đập bằng chém, dao, bom; vỡ thành mảnh pixel kèm tiếng vỡ riêng theo chất liệu.', 'Xu, dao/bom/bình lửa, tim nhỏ hiếm.', 'Giúp nhẹ ở đoạn khó (đúng ý), có trần.', 'Vừa', 'Ít.'],
  ['PA2 Có bình "mimic"', 'Như trên', 'Như PA1 nhưng 1/10 bình bật ra một con quái nhỏ.', 'Như trên', 'Khó hơn một chút, bất ngờ', 'Vừa', 'Có thể khó chịu; trái ý "giữ độ khó".']]],
 A4: ['A4 · Câu cá (chỉ map có nước)', [
  ['PA1 ★ Câu ở bờ', 'Đại Dương (bãi bờ lúc bắt đầu, cạnh Ông Tư); Đầm Lầy (thêm 2 ao nhỏ)', 'Đứng ở chỗ câu (có biển báo + phao), nhấn E (nút "Nói chuyện / dùng") để thả câu. Chờ 2-6 giây, phao giật thì nhấn E lần nữa khi kim nằm trong vùng xanh (1 lần nhấn, tay cầm Y, cảm ứng nút dùng). Không bắt buộc, thoát bất cứ lúc nào.', 'Xu, đạn; hiếm: "Cá Vàng" hồi đầy máu khi ăn. Tối đa 5 lần mỗi chỗ mỗi lượt chơi.', 'Không ảnh hưởng đường chính.', 'Vừa', 'Ít. Co-op: mỗi người câu riêng, chủ phòng xác nhận phần thưởng.'],
  ['PA2 Câu kiểu kéo dây', 'Như trên', 'Giữ và thả nút để giữ căng dây (minigame dài hơn).', 'Như trên', 'Như trên', 'Lớn', 'Khó dùng trên cảm ứng; lâu hơn, dễ nhàm.']]],
 A5: ['A5 · Mở rộng cần gạt / công tắc', [
  ['PA1 ★ Lối tắt + cầu', 'Các map dài (Sa Mạc trở đi)', 'Thêm 2 cơ chế phụ dùng lại cần gạt có sẵn: (1) cửa lối tắt mở từ phía sau, nối về checkpoint trước, để đỡ đi lại khi chết; (2) cần gạt làm cầu rút / bệ di chuyển dẫn vào khu thưởng.', 'Đi lại nhanh hơn, rương thưởng', 'Dễ hơn chút khi chết nhiều lần', 'Vừa', 'Ít.'],
  ['PA2 Bật/tắt bẫy', 'Như trên', 'Cần gạt tắt gai/cưa trong một đoạn bẫy.', 'Đi qua an toàn', 'Giảm độ khó đoạn bẫy', 'Nhỏ', 'Có thể bị dùng để né thử thách.']]],
 B: ['B · Ngày và đêm', [
  ['PA1 ★ Theo quãng đường', 'Đồng Cỏ, Rừng, Sa Mạc, Đỉnh Băng, Đầm Lầy (bỏ Hang, Núi Lửa, Đường Hầm, Đại Dương; Thành Trì vốn luôn là đêm)', 'Trời đổi theo vị trí trong map: đầu map sáng, giữa map hoàng hôn, gần boss là đêm. Màu trời và ánh sáng đổi mượt; đêm tối thêm tối đa ~25% (đèn lồng vẫn soi), có sao và đom đóm; âm nền đổi (chim ban ngày, dế và cú ban đêm). Dùng lại hệ thống hạt và vùng tối sẵn có.', 'Không có (thẩm mỹ, cảm giác hành trình)', 'Không đổi: không thêm quái ban đêm, không tối hơn vùng tối hiện có.', 'Vừa', 'Ít. Co-op tự đồng bộ vì mỗi người tính theo vị trí camera của mình; không cần lưu.'],
  ['PA2 Theo thời gian thực', 'Như trên', 'Một vòng ngày-đêm 6-8 phút trong map.', 'Như trên', 'Người chơi chậm gặp đêm nhiều hơn (thiệt hơn)', 'Vừa', 'Phải đồng bộ giờ qua mạng; có thể bất công.']]],
 C: ['C · Khu bí mật', [
  ['PA1 ★ Đủ 4 + 3 loại lối mới', 'Cả 10 map (Đại Dương dùng hốc tường có sẵn)', 'Sửa lỗi thiếu: 4 map (Rừng, Hang, Sa Mạc, Đầm Lầy) hiện chỉ có 2 ngách sàn giả (bộ sinh không tìm được chỗ). Mỗi map tối thiểu 4 khu bí mật, có thêm 3 loại lối ẩn mới: (1) bụi cây che lối (chém mở, đi với A1); (2) gạch lạ: một viên hơi lệch màu, đánh vỡ được; (3) tường nứt dẫn vào phòng có rương (phá bằng bom có sẵn). Gợi ý tinh tế: vài hạt lấp lánh và tiếng gió hút nhẹ khi đứng gần.', 'Rương: xu nhiều, đạn, mảnh truyện (lore); không thêm đồ mạnh.', 'Không đổi', 'Vừa-Lớn', 'Ít; phòng bí mật được khoét trong đất đặc nên không cắt đường chính.'],
  ['PA2 Chỉ bù số lượng', 'Cả 10 map', 'Chỉ sửa để mọi map có đủ 3-4 ngách sàn giả kiểu cũ.', 'Như cũ', 'Không đổi', 'Nhỏ', 'Ít, nhưng không có gì mới.']]],
 D: ['D · Âm thanh môi trường', [
  ['PA1 ★ Bước chân theo ô + điểm âm', 'Cả 10 map', '(1) Bước chân theo ô dưới chân trong cùng map: nền chính (cỏ/đất/cát/tuyết/đá), sàn nổi (gỗ, đá hoặc kim loại theo kiểu bẫy của map), băng, lội nước, bệ kim loại di chuyển. (2) Âm nền: 10 map đã có (audio.js:285), chỉ bù "điểm âm" cục bộ: tiếng lửa đuốc khi đứng gần, nước nhỏ giọt gần hồ, gió ở chỗ cao; và âm nền đổi theo ngày-đêm (B). Đo lại để bằng mức bước chân hiện có.', 'Không', 'Không', 'Vừa', 'Ít.'],
  ['PA2 Chỉ bước chân', 'Cả 10 map', 'Chỉ làm phần (1).', 'Không', 'Không', 'Nhỏ', 'Ít.']]],
 E: ['E · NPC và nhiệm vụ phụ', [
  ['PA1 ★ Chuỗi "Tàn Lửa Tháp"', 'Cả 10 map, dùng NPC có sẵn', 'Mỗi map 1 nhiệm vụ ngắn có câu chuyện, thoại đổi theo 3 giai đoạn (chưa nhận, đang làm, xong) và nhớ qua file lưu. Mỗi nhiệm vụ trả 1 "Tàn Lửa Tháp" (mảnh ký ức của Người Giữ Đèn ở tháp đó). Ở Thành Trì, mang đủ tàn lửa tới bàn thờ đèn để mở một đoạn truyện kết thêm và màu đèn lồng mới. Nhiệm vụ dùng chính các thứ mới (bụi, bình, câu cá, bí mật) nên không thành việc vặt. Danh sách nhiệm vụ ở bảng dưới.', 'Xu, đạn, mảnh truyện, màu đèn lồng (trang trí, không tăng chỉ số)', 'Không đổi: không thưởng chỉ số', 'Lớn', 'Vừa: nhiều thoại song ngữ; co-op chỉ chủ phòng nhận nhiệm vụ, cả nhóm cùng thấy tiến độ.'],
  ['PA2 Nhiệm vụ đếm', 'Cả 10 map', 'Mỗi NPC giao "diệt N quái" hoặc "nhặt N vật".', 'Xu', 'Không đổi', 'Nhỏ', 'Nhàm, đúng thứ brief muốn tránh.']]],
 F: ['F · Dịch chuyển nhanh', [
  ['PA1 ★ Tại checkpoint', 'Các map dài (Hang trở đi, kể cả Đại Dương)', 'Đứng ở một checkpoint đã chạm, nhấn E: hiện danh sách các checkpoint đã chạm của map này, chọn rồi bay tới. Bị khóa khi: đánh boss, đang trong đấu trường kín, thử thách, câu đố hẹn giờ, đang có chìa phải mang. Chỉ tới checkpoint đã chạm, nên không thể vượt cổng chưa mở. Co-op: chỉ chủ phòng mở được, cả nhóm cùng dịch chuyển (dùng lại hàm gom nhóm có sẵn). Không ghi gì vào file lưu.', 'Đỡ đi lại', 'Không đổi', 'Vừa', 'Ít.'],
  ['PA2 Từ menu tạm dừng', 'Như trên', 'Dịch chuyển từ bất kỳ đâu qua menu.', 'Như trên', 'Có thể dùng để thoát nguy hiểm', 'Vừa', 'Lách luật dễ hơn.'],
  ['Nâng cấp (tùy chọn)', 'Màn bản đồ', '"Chọn lại map" ĐÃ CÓ. Có thể thêm hiển thị tiến độ từng map (ngọc, bí mật, nhiệm vụ đã xong) để khuyến khích chơi lại.', 'Động lực chơi lại', 'Không', 'Nhỏ', 'Ít.']]],
 G: ['G · Khóa kiểu Metroidvania (CHỈ ĐỀ XUẤT, CHƯA LÀM)', [
  ['PA1 ★ Nhẹ: thấy mà chưa với tới', 'Mọi map', 'Khu thưởng thấy được nhưng cần kỹ năng ĐÃ CÓ mới vào: kệ cao cần nhảy đôi + lướt, khe thấp cần lướt, tường nứt cần bom. Vào được ngay lần đầu, không cần quay lại.', 'Rương bí mật', 'Không', 'Vừa', 'Thấp: bộ sinh map chỉ cần khoét thêm phòng.'],
  ['PA2 Vừa: quay lại map cũ', 'Map 1-5', 'Ở map 5, nhặt "Đèn Soi Bí Mật"; nó làm hiện "gạch ấn" ở map 1-4 dẫn vào phòng mới. Map sinh theo hạt giống cố định nên vị trí ổn định; dùng chức năng chọn lại map có sẵn.', 'Phòng mới ở map cũ', 'Không', 'Lớn', 'Vừa: cần cờ mới trong file lưu (có giá trị mặc định cho file cũ); co-op người mới chưa có đèn.'],
  ['PA3 Nặng: khóa đường chính', 'Mọi map', 'Đường chính bị khóa theo kỹ năng nhặt dần, phải quay lại map cũ.', 'Kiểu Metroidvania thật', 'Đổi cả nhịp game', 'Rất lớn', 'Cao: phá cốt truyện 10 tháp theo thứ tự, phá cân bằng, co-op người mới vào bị kẹt. Không khuyên.']]],
};
const QUESTS = [
 ['1 · Đồng Cỏ', 'Lila', 'Chuông gió của bà Lila bị gió cuốn vào bụi cây: chém bụi tìm 3 mảnh chuông.', 'Tàn Lửa Tháp 1: Người Giữ Đèn từng treo chuông gió để báo bão.'],
 ['2 · Rừng', 'Đội trưởng Bram', 'Tìm 3 thẻ tên của đội tuần đêm mất tích (trong khu bí mật).', 'Tàn Lửa 2: đêm đội tuần rời tháp 2.'],
 ['3 · Hang', 'Pháp sư', 'Đập 4 bình pha lê "vọng âm" để nghe lại lời các thợ đá.', 'Tàn Lửa 3: ai đã khắc tim pha lê.'],
 ['4 · Sa Mạc', 'Thợ rèn Durin', 'Tìm 3 khuôn đúc đèn cũ trong chum gốm và phòng thùng.', 'Tàn Lửa 4: chiếc đèn đầu tiên.'],
 ['5 · Đỉnh Băng', 'Thiên thần Seraph', 'Thắp lại 3 đống lửa sưởi cho người leo núi (dùng bình lửa có sẵn).', 'Tàn Lửa 5: Rimvald trước khi đóng băng.'],
 ['6 · Núi Lửa', 'Thợ rèn Durin', 'Mang "Than Tim Lửa" (rơi từ quái lửa) về lò của tháp 6 mà không để tắt (có giờ, rộng rãi).', 'Tàn Lửa 6: lò rèn của Kaldrok.'],
 ['7 · Đầm Lầy', 'Phù thủy đầm lầy', 'Hái 4 nấm phát quang (bụi nấm chém được) cho thuốc ngủ ngon của bà.', 'Tàn Lửa 7: lời ru của Morvella.'],
 ['8 · Đại Dương', 'Ông Tư Đánh Cá', 'Câu được Cá Vàng (câu cá A4).', 'Tàn Lửa 8: ngọn hải đăng bị nhấn chìm.'],
 ['9 · Đường Hầm', 'Thợ mỏ', 'Tìm 3 đèn mỏ của đồng đội (trong thùng hầm và gạch lạ).', 'Tàn Lửa 9: lệnh đào sâu hơn.'],
 ['10 · Thành Trì', 'Lila + các NPC cũ', 'Mang các Tàn Lửa Tháp tới bàn thờ đèn trước cửa Quốc.', 'Đoạn truyện thêm về Người Giữ Đèn, màu đèn lồng "Chín Tháp".'],
];

const children = [
 new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('LAST LANTERN · Giai đoạn 5: Kiểm kê map và đề xuất')] }),
 P('Phần 1 là kết quả bước 5.0 (đã duyệt). Phần 2 là đề xuất bước 5.1 để bạn chọn; chưa có gì được làm.'),
 H1('Phần 1 · Kiểm kê 5.0'),
 P('Số liệu đo bằng bộ sinh map (genLevel) trong trình duyệt. "Mảnh · Ngọc · Trứng" = mảnh mặt trời trên giàn leo, Ngọc Sao trên kệ cao, quả trứng bí mật.'),
 table([2000, 1100, 900, 700, 1300, 1500, 2100, 900, 1500, 3038], ['Map', 'Dài (ô)', 'Checkpoint', 'NPC', 'Ngách sàn giả', 'Mảnh · Ngọc · Trứng', 'Câu đố / cổng', 'Vùng tối', 'Nước', 'Hợp với tính năng'], MAPS),
 H2('Đã có sẵn (không làm lại)'),
 BL('Chủ đề riêng, nhiều tầng, hạt/thời tiết, vùng tối, tường nổ bom, cần gạt, chìa, đuốc, câu đố, checkpoint, lướt, nhảy đôi, dây leo (5 ở Đầm Lầy), cửa hàng NPC.'),
 BL('Âm nền theo map: cả 10 map đã có (audio.js:285). Bước chân theo map (chưa theo ô).'),
 BL('Sàn giả có gợi ý: mờ đi khi đến gần và lấp lánh (game.js:3671-3675).'),
 BL('Chọn lại map đã qua: ĐÃ CÓ ở màn bản đồ.'),
 H2('10 mục brief yêu cầu xác nhận'),
 table([2600, 1300, 11138], ['Mục', 'Kết luận', 'Bằng chứng'], CHECK),
 H2('Phát hiện thêm'),
 BL('4 trong 9 map trên cạn (Rừng, Hang, Sa Mạc, Đầm Lầy) chỉ có 2 ngách sàn giả thay vì 3, vì bộ sinh không tìm được chỗ phẳng đủ dài. Đề xuất sửa trong mục C.'),
 BL('Xu vẫn dùng ở quầy NPC (game.js:2564), nhưng cửa hàng vũ khí đang miễn phí, nên phần thưởng xu ít giá trị. Vì thế các phần thưởng bên dưới trộn thêm đạn, tim nhỏ, mảnh truyện và đồ trang trí.'),
 BL('Co-op do chủ phòng mô phỏng và gửi ảnh chụp trạng thái, kể cả các dòng ô bản đồ bị đổi (game.js:6081 coopSnapshot). Vật thể mới chỉ cần nằm trong danh sách đồng bộ là khách thấy; ô bị phá tự đồng bộ.'),
 H1('Phần 2 · Đề xuất 5.1'),
 P('Mỗi tính năng có 2 phương án (G có 3), ★ = nên chọn. Mọi chữ song ngữ; nút mới dùng nút "Nói chuyện / dùng" (E, tay cầm Y, nút dùng trên cảm ứng) nên không cần phím mới. File lưu: chỉ THÊM trường mới có giá trị mặc định, file cũ vẫn chạy.'),
];
for (const k of ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F']) { children.push(H2(F[k][0])); children.push(table(COLS, HEAD, F[k][1], true)); if (k === 'E') { children.push(P('Danh sách nhiệm vụ (PA1):')); children.push(table([1800, 2200, 6038, 5000], ['Map', 'NPC', 'Nhiệm vụ', 'Phần thưởng truyện'], QUESTS)); } }
children.push(H1('Phần 3 · Khóa kiểu Metroidvania (G): chỉ phân tích'));
children.push(P('Map được sinh theo công thức với hạt giống cố định, nên vị trí mỗi phòng ổn định giữa các lần chơi. Đây là điều kiện cần cho kiểu quay lại map cũ (PA2).'));
children.push(table(COLS, HEAD, F.G[1], true));
children.push(H1('Phần 4 · Thứ tự làm đề xuất'));
['D (bước chân theo ô): nhỏ, an toàn, kiểm tra cách đo âm.', 'A3 (bình) và A1 (bụi): nền cho C và E.', 'C (khu bí mật).', 'F (dịch chuyển nhanh).', 'A2 (thùng) và A5 (cần gạt).', 'B (ngày-đêm).', 'A4 (câu cá).', 'E (nhiệm vụ phụ, cần các phần trên).', '5.3 kiểm tra toàn bộ.'].forEach((t, i) => children.push(BL(t, (i + 1) + '. ')));
children.push(P('Mỗi mục làm xong sẽ được commit riêng, báo cáo, rồi dừng chờ duyệt.'));

const doc = new Document({
  numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: 'bullet', text: '•', style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
  styles: { default: { document: { run: { font: 'Arial' } } } },
  sections: [{ properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 16838, height: 11906 }, margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, children }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('D:/Game/De_xuat_map_GD5.docx', b); console.log('ok'); });
