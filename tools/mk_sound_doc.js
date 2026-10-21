// Builds D:\Game\De_xuat_am_thanh_GD4.docx: phase 4 sound proposal (voice, footsteps, skill sounds, music) for every
// boss, boss form, dragon and summon. Everything is synthesised in src/audio.js (no recorded samples).
const d = require('docx'), fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, HeadingLevel, BorderStyle, PageOrientation } = d;
const W = 15038, B = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' }, BS = { top: B, bottom: B, left: B, right: B };
const run = (t, o) => new TextRun(Object.assign({ text: t, size: 17 }, o || {}));
const cell = (w, t, o) => new TableCell(Object.assign({ width: { size: w, type: WidthType.DXA }, borders: BS, margins: { top: 50, bottom: 50, left: 80, right: 80 }, children: [new Paragraph({ children: [run(t, (o && o.r) || {})] })] }, o && o.fill ? { shading: { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } } : {}));
const COLS = [2300, 3000, 2000, 4538, 3200];
const HEAD = ['Nhân vật', 'Giọng / tiếng gầm', 'Bước chân / di chuyển', 'Âm thanh từng chiêu', 'Nhạc nền (chủ đề · điệu · nhạc cụ đặc trưng)'];
const table = (rows, head) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: COLS, rows: [new TableRow({ tableHeader: true, children: (head || HEAD).map((h, i) => cell(COLS[i], h, { fill: 'E8DDB5', r: { bold: true } })) })]
  .concat(rows.map(r => new TableRow({ cantSplit: true, children: r.map((t, i) => cell(COLS[i], t, i === 0 ? { r: { bold: true } } : {})) }))) });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 100 }, children: [new TextRun(t)] });
const P = t => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: t, size: 20 })] });
const BL = (t, b) => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 40 }, children: b ? [new TextRun({ text: b, bold: true, size: 20 }), new TextRun({ text: t, size: 20 })] : [new TextRun({ text: t, size: 20 })] });

const BOSSES = [
 ['Gulgor · Bụng Nuốt Đèn (map 1)', 'Ợ trầm, nhầy nhụa: âm trầm rung kèm tiếng sủi bọt; khi đau kêu "ọc" cao; chết: xì hơi dài rồi lép bép.', 'Nhóp nhép ướt mỗi lần nảy, nặng dần khi nổi điên.', 'Nhảy/nảy 3: "bộp" dẻo + vang trầm · Phun nhầy: tiếng phụt ướt · Tách slime: "toạc" ướt · Dậm: bịch đục · Thủ: màng nhầy căng "boing" · Gầm: ợ dài rung đất.', 'Đầm rêu vui-rợn: thang thứ, 112 bpm, lead tam giác "nhún"; lớp riêng: tiếng bong bóng theo nhịp.'],
 ['Veylith · Kẻ Dệt Lời Thì Thầm (map 2)', 'Rít lách cách nhiều chân + tiếng thì thầm lớp sau (không lời); đau: rít ngắn chói; chết: thì thầm tắt dần.', 'Lách tách 8 chân nhanh, nhẹ.', 'Lao: tràng lách cách · Giăng tơ: "vút" căng dây · Phun độc: "phụt" xì · Phục kích/ẩn thân: thì thầm vụt qua tai · Gọi nhện con: lạo xạo · Gầm: rít + thì thầm dồn dập.', 'Rừng thì thầm: thang thứ hòa âm (harmonic minor), 120 bpm, lead vuông mỏng; lớp riêng: tiếng thì thầm lọc thông dải ở nhịp lặng.'],
 ['Prismor · Trái Tim Pha Lê Câm (map 3)', 'Không có miệng → không gầm: chỉ ngân pha lê (chuông kính trầm) + rung đá; đau: tiếng nứt kính; chết: vỡ kính dài.', 'Đá nặng "cộp" + leng keng pha lê nhỏ.', 'Trồi pha lê: rắc + ngân · Khiên: vòm kính ngân cao · Tia sáng: ù ù rồi "xèo" sáng · Mưa pha lê: leng keng rải · Đập: đá nện + vỡ kính.', 'Hang pha lê: thang ngũ cung thứ, 116 bpm, lead tam giác; lớp riêng: chuông kính (sine) vang dài.'],
 ['Khepsar · Kẻ Xin Được Ngủ (map 4)', 'Giọng khô, thở dài buồn ngủ, cát rơi rào rào; đau: rên khàn; chết: tiếng thở ra thật dài như ngủ thiếp.', 'Lê bước kéo vải, cát xào xạc.', 'Lời nguyền: ngân thấp + rít cát · Lốc cát: gió xoáy khô · Dịch chuyển: cát rơi "xoẹt" · Bắn: bọ hung bay vo vo · Lao: cát cuộn · Ẩn thân: cát đổ.', 'Sa mạc ngủ quên: thang Phrygian (nửa cung đầu, nghe "cổ"), 104 bpm, lead răng cưa lọc mềm; lớp riêng: chuông lục lạc nhỏ.'],
 ['Rimvald · Trái Tim Tự Đóng Băng (map 5)', 'Giọng trầm lạnh có tiếng vọng, như gió qua hang băng; đau: băng nứt; chết: trái tim băng vỡ "tách" rồi ngân.', 'Băng giòn "rộp" từng bước.', 'Hơi thở băng: gió buốt + kết tinh lấp lánh · Tường băng: rắc rắc dựng lên · Bão tuyết: gió hú · Xoay: gió quất · Thủ: kính băng ngân.', 'Băng giá cô độc: thang thứ tự nhiên, 98 bpm (chậm, nặng), lead tam giác; lớp riêng: hộp nhạc (music-box) lạnh.'],
 ['Kaldrok · Lò Rèn Biết Đi (map 6)', 'Gầm như lò thổi: ống bễ phì phò + kim loại rền; đau: tiếng búa gõ đe; chết: lò tắt xì hơi nước.', 'Bước nặng có "keng" kim loại (đe rèn).', 'Cột dung nham: phun ùng ục · Mưa thiên thạch: rít rơi + nổ · Quét lửa: phừng · Lao: đá lăn · Khiên: lửa bùng · Đập: búa xuống đe "KENG".', 'Lò rèn: thang thứ hòa âm, 128 bpm, lead răng cưa; lớp riêng: tiếng búa gõ đe trên phách 2 và 4.'],
 ['Quốc, Vua Nhật Thực (trận Quốc)', 'Giữ giọng quỷ hiện có (méo, vọng) nhưng mỗi dạng có cao độ/màu riêng (xem bảng dưới).', 'Bước giáp nặng.', 'Tia sáng: ù tối "vù" · Dịch chuyển: hút ngược · Xoay: gió đen · Trồi: đất nứt · Lốc: gió đen · Ẩn thân: thì thầm.', 'Nhật thực: thang thứ, nhịp tăng theo dạng; lớp riêng: hợp xướng tối (pad nhiều giọng sine).'],
 ['Morvella · Lời Ru Của Đầm Lầy (map 7)', 'Giữ giọng rít ướt hiện có; thêm câu ngân "ru" (giai điệu 3 nốt) khi xuất hiện.', 'Trôi: bong bóng lục bục.', 'Phun nhầy: phụt ướt · Bắn bào tử: "puff" · Gọi con: lụp bụp · Mưa bào tử: rắc mềm · Xoay: gió ẩm.', 'Lời ru đầm lầy: thang thứ, 6/8 cảm giác ru, 96 bpm; lớp riêng: giai điệu ru bằng sáo (sine).'],
 ['Oktavor · Kẻ Nhấn Chìm Tháp Thứ Tám (map 8)', 'Giữ tiếng gầm vực sâu + bong bóng.', 'Bơi: nước cuộn trầm.', 'Trồi: nước phun · Bắn mực: phụt đặc · Mưa: nước rơi · Lao: sóng · Xúc tu: quất ướt "chát".', 'Vực sâu: thang thứ, 92 bpm, bass rất trầm; lớp riêng: tiếng sonar.'],
 ['Vorgrub · Miệng Nuốt Tàn Lửa (map 9)', 'Giữ tiếng nghiến đá + rít.', 'Chui đất: đất lở ầm ì.', 'Chui/trồi: đất nổ tung · Lao: nghiến ầm · Mưa đá: lộp độp · Gọi con: đất sủi.', 'Đường hầm: thang Locrian (rất bất an), 124 bpm; lớp riêng: trống trầm taiko.'],
];
const QUOC = [
 ['Dạng 1 · Người Giữ Đèn Sa Ngã', 'Giọng người còn rõ, méo nhẹ; câu "hừ" khinh bỉ.', 'Bước giáp.', 'Chém: thép rít · Đèn nứt: leng keng vỡ.', 'Nhạc trận Quốc: bắt đầu chậm (100 bpm).'],
 ['Dạng 2 · Bóng Cô Đơn', 'Tiếng nức nở trẻ con méo (không lời), vọng xa.', 'Không chân: lướt vù nhẹ.', 'Vươn tay bóng: kéo dài "vúuu".', 'Giữ nhạc, bỏ trống (chỉ pad) cho cô đơn.'],
 ['Dạng 3 · Chó Săn Không Chủ', 'Gầm gừ chó + tru ngắn; xích lắc.', 'Chạy bốn chân dồn dập + xích leng keng.', 'Vồ: gầm + nhảy · Cắn: tách răng.', 'Tăng 110 bpm, trống dồn.'],
 ['Dạng 4 · Kẻ Mang Xích Lời Thề', 'Gầm trầm nặng nề + xích.', 'Bước rất nặng, xích kéo lê.', 'Quật tạ xích: vút + nện · Xích bay: leng keng.', '116 bpm, lớp xích kim loại.'],
 ['Dạng 5 · Hiệp Sĩ Hết Hơi Ấm', 'Không giọng: gió lạnh hú qua giáp rỗng.', 'Giáp rỗng lạch cạch.', 'Kiếm lớn: thép ngân dài · Sương: gió buốt.', '120 bpm, lead tam giác lạnh.'],
 ['Dạng 6 · Đôi Cánh Lỡ Đỉnh', 'Gầm khàn kiệt sức, thở dốc.', 'Vỗ cánh rách "phạch" lệch nhịp.', 'Bổ nhào: gió rít · Lông đen rơi: xào xạc.', '124 bpm.'],
 ['Dạng 7 · Tro Tàn Chín Ngọn Tháp', 'Gầm lửa + tro lách tách.', 'Bước tro "phụp" bụi.', 'Chín ngọn lửa: 9 tiếng phừng nối nhau · Nổ tro: ầm khô.', '128 bpm, lớp lửa.'],
 ['Dạng 8 · TRÁI TIM NHẬT THỰC', 'Gầm quỷ hiện có ở mức mạnh nhất + hợp xướng tối.', 'Lơ lửng: ù ù trầm.', 'Mọi chiêu thêm "nhịp tim" trầm trước khi ra đòn.', 'Cao trào 132 bpm, hợp xướng tối đầy đủ.'],
];
const GATE = [
 ['Ngài Shorty Phong · Quản Gia Mũ Cao', 'Cười khúc khích lịch sự (giọng vuông cao), hắng giọng.', 'Giày da "cộc cộc" gọn.', 'Ném mũ: vút xoay · Lướt: sột soạt áo đuôi tôm.', 'Điệu waltz hơi lệch (3 phách), 132 bpm.'],
 ['Shorty Phong · Quỷ Mũ Cao', 'Tiếng cười méo thành gầm.', 'Bước dài nặng.', 'Nanh cắn: rắc · Mũ thành lưỡi: chém xoáy.', 'Waltz bị bẻ nhịp, nhanh hơn.'],
 ['Thầy Sy · Nhà Pha Độc Áo Xanh', 'Lẩm bẩm "hừm" khoa học, tiếng chai lọ.', 'Bước nhẹ + chai lọ va lách cách.', 'Ném lọ: vỡ kính + xì độc · Mây độc: sủi bọt.', 'Phòng thí nghiệm: thang toàn cung (bí ẩn), 108 bpm.'],
 ['Sy · Mãng Xà Độc Dược', 'Rít rắn dài + sủi bọt.', 'Trườn: sột soạt vảy.', 'Phun độc: phụt + xì · Quấn: siết rít.', 'Nhanh hơn 4 bpm, thêm bass rít.'],
];
const DRAGONS = [
 ['Ignar · Rồng Con Lạc Đàn (map 1)', 'Tiếng gầm rồng hiện có nhưng cao hơn, non hơn (rồng con).', 'Vỗ cánh nhẹ.', 'Phun lửa: phừng nhỏ · Bổ nhào: vút.', 'Nhạc trận map 1, giai điệu "ngạo nghễ" lead vuông.'],
 ['Ignarok · Vảy Tro (map 6, dạng 1)', 'Gầm rồng trầm hiện có.', 'Vỗ cánh nặng "phành phạch".', 'Hơi thở lửa: phừng dài · Bổ nhào: rít · Đậu: đất rung.', 'Nhạc rồng: 126 bpm, lớp kèn đồng (brass) tổng hợp.'],
 ['Ignarok · Ba Cơn Thịnh Nộ (dạng 2)', 'Ba giọng gầm chồng nhau, lệch cao độ (ba đầu).', 'Như trên, nặng hơn.', 'Lửa ba luồng: ba tiếng phừng lệch nhịp.', 'Tăng 4 bpm.'],
 ['Ignarok · Lửa Hoàng Hôn (dạng 3)', 'Gầm có vọng tím, như từ trong bóng tối.', 'Vỗ cánh có tiếng gió đêm.', 'Lửa tím: ù + xèo · Sương bóng: thì thầm.', 'Chuyển thang thứ tối hơn, lớp hợp xướng.'],
];
const SUMS = [
 ['Khổng Lồ Mạch Đất', 'Tiếng đá rền trầm "ừm".', 'Bước đá nặng rung đất.', 'Búa đá: nện + đất nứt; tiến hóa: rền vang núi.', '—'],
 ['Chúa Sấm Rền', 'Giọng già vang, tiếng sấm xa.', 'Áo choàng sột soạt.', 'Gậy sét: tách điện + sấm.', '—'],
 ['Nàng Triều Dâng', 'Ngân trong như hát (không lời).', 'Bước nước "tóp".', 'Đinh ba: sóng vỗ + phụt nước.', '—'],
 ['Nàng Trăng Bạc', 'Ngân cao, mờ ảo.', 'Lướt nhẹ, cánh phất.', 'Cung trăng: dây cung ngân + mũi tên sáng "vút".', '—'],
 ['Khổng Lồ Băng Hà', 'Gầm trầm lạnh.', 'Băng vỡ dưới chân.', 'Búa băng: nện + băng vỡ tung.', '—'],
 ['Hoàng Đế Mặt Trời Xưa', 'Giọng uy nghi, có vang.', 'Bước đều trang trọng.', 'Mặt trời nhỏ: lửa phừng + chuông vàng.', '—'],
 ['Tướng Quân Vô Ảnh', 'Thở qua mặt nạ, "hự" ngắn.', 'Bước lén nhẹ, giáp sột soạt.', 'Chém: thép rít sắc + vỏ kiếm "cạch".', '—'],
 ['Ông Cây Rễ Cổ', 'Kẽo kẹt gỗ già, rì rào lá.', 'Rễ "thịch" mềm.', 'Đập cành: gỗ nện + lá xào.', '—'],
 ['Hộ Vệ Rạng Đông', '"Hự" chắc nịch.', 'Giáp vàng "cạch cạch".', 'Đập khiên: kim loại "boong".', '—'],
 ['Chiến Nữ Giáo Sao', 'Hô ngắn trong.', 'Bước nhẹ + cánh.', 'Đâm giáo: rít + sao lấp lánh.', '—'],
 ['Sứ Giả Hào Quang', 'Hợp âm thiên thần ngắn.', 'Lướt, cánh phất.', 'Kiếm sáng: ngân + "xoẹt".', '—'],
 ['Cặp Đá Canh Cổng', 'Ù ù đá, hai giọng lệch nhau.', 'Bước đá đôi.', 'Đấm đá: "cộp" nặng.', '—'],
 ['Phượng Hoàng Hồi Sinh', 'Kêu chim lửa cao vút.', 'Vỗ cánh lửa.', 'Cầu lửa: phừng + rơi rít.', '—'],
 ['Rồng Vàng Cổ Đại', 'Gầm rồng trầm, uy nghi.', 'Vỗ cánh rộng.', 'Hơi thở vàng: phừng + chuông.', '—'],
 ['Rồng Lửa Than Hồng', 'Gầm rồng có tiếng than nổ lách tách.', 'Vỗ cánh nặng.', 'Hơi thở than: phừng + lách tách.', '—'],
 ['Kỳ Lân Tia Chớp', 'Hí ngắn có điện.', 'Vó gõ "lóc cóc" + tia điện.', 'Dậm sét: sấm nhỏ + tách điện.', '—'],
 ['Cá Voi Ánh Sáng', 'Tiếng hát cá voi dài, trầm.', 'Bơi: nước cuộn mềm.', 'Mưa sao chổi: ngân + rơi rít.', '—'],
 ['Hồ Ly Lửa Xanh', 'Kêu cáo ngắn, ma mị.', 'Bước đệm nhẹ.', 'Lửa hồ ly: "phù" xanh.', '—'],
 ['Ba Bóng Vọng', 'Thì thầm ba giọng.', 'Lướt không tiếng.', 'Chém bóng: rít mờ.', '—'],
 ['Khổng Lồ Đá Cuội (thú cưng lớn)', 'Đá cuội lăn lạo xạo.', 'Bước đá cuội.', 'Đấm: cuội va "cộp cộp".', '—'],
];

const doc = new Document({
  numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: 'bullet', text: '•', style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
  styles: { default: { document: { run: { font: 'Arial' } } } },
  sections: [{ properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 16838, height: 11906 }, margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, children: [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('LAST LANTERN · Giai đoạn 4: Đề xuất âm thanh')] }),
    P('Bản đề xuất để duyệt trước khi làm. Duyệt xong mình mới áp dụng, rồi đo và cân bằng âm lượng giữa các boss.'),
    H1('1. Hiện trạng (kiểm kê)'),
    BL('Toàn bộ âm thanh của game là âm tổng hợp bằng code (Web Audio trong src/audio.js), không có file ghi âm nào, nên không có rủi ro bản quyền âm thanh.'),
    BL('Giọng boss: mỗi map có một giọng gầm (b0–b6); Morvella, Oktavor và Vorgrub có giọng kinh dị riêng; Quốc dùng giọng quỷ méo; rồng dùng chung một giọng. Shorty và Sy đang mượn giọng của boss map đó, và 8 dạng của Quốc chung một giọng.'),
    BL('Âm chiêu: mỗi loại chiêu có một âm chung cho mọi boss (ví dụ "đập" của Prismor và Kaldrok cùng một tiếng "boom").'),
    BL('Bước chân: boss và triệu hồi chưa có tiếng bước chân (chỉ người chơi có).'),
    BL('Nhạc: mỗi boss có nhạc riêng nhưng chỉ là biến thể của nhạc màn đó (cùng một bộ máy chiptune EDM, đổi tông/tốc độ), nên các trận nghe khá giống nhau.'),
    BL('Triệu hồi: không có giọng, không có bước chân; đòn đánh dùng âm chung (boom, slash, zap...).'),
    H1('2. Cách làm'),
    BL('Vẫn tổng hợp bằng code, không dùng mẫu âm của game khác, không bắt chước nhạc hay giọng nhân vật nào có sẵn.'),
    BL('Mỗi boss có một "bộ âm" riêng: giọng, bước chân và một bảng âm thay thế cho từng chiêu của boss đó. Chiêu chưa có âm riêng vẫn dùng âm chung như bây giờ.'),
    BL('Nhạc trận: giữ bộ máy nhạc hiện tại, mỗi boss chọn điệu thức, tốc độ, nhạc cụ chính và thêm một "lớp đặc trưng" (chuông kính, hộp nhạc, búa đe, hợp xướng tối...) để mỗi trận có màu riêng.'),
    BL('Cân bằng âm lượng: đo độ lớn (RMS và đỉnh) của giọng, chiêu và nhạc từng boss trong trình duyệt, đưa về cùng một mức đích (chênh không quá khoảng ±2 dB), boss cuối được phép to hơn một chút. Sẽ gửi bảng đo trước/sau.'),
    BL('Không đổi: máu, sát thương, thời điểm và thứ tự chiêu, cân bằng. Chỉ thêm và đổi âm thanh.'),
    BL('Sẽ có một trang thử âm (chỉ ở bản debug) để bạn bấm nghe từng giọng, từng chiêu và từng bản nhạc.'),
    H1('3. Boss chính'), table(BOSSES),
    H1('4. Tám dạng của Quốc'), table(QUOC),
    H1('5. Boss phụ (Shorty, Sy)'), table(GATE),
    H1('6. Rồng'), table(DRAGONS),
    H1('7. Triệu hồi'), P('Triệu hồi không có nhạc riêng (nhạc trận vẫn chạy). Dạng tiến hóa dùng cùng bộ âm nhưng trầm và to hơn, kèm một tiếng "vang" khi tiến hóa.'),
    table(SUMS, ['Triệu hồi', 'Giọng (khi xuất hiện / tấn công / tiến hóa)', 'Bước chân', 'Âm đòn đánh', 'Nhạc']),
    H1('8. Cần bạn quyết'),
    BL('Duyệt cả bảng, hoặc chỉ ra dòng muốn đổi.'),
    BL('Bước chân của boss và triệu hồi có thể làm game ồn hơn khi nhiều triệu hồi cùng đi. Đề xuất: bước chân triệu hồi nhỏ và giới hạn tối đa 2 tiếng mỗi lúc.'),
  ] }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('D:/Game/De_xuat_am_thanh_GD4.docx', b); console.log('ok'); });
