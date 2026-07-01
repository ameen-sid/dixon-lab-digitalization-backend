import ExcelJS from 'exceljs';

export async function generateTearDownExcel(request: any, plan: any, checksheets: any[]): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'Dixon Lab Management System';
	workbook.lastModifiedBy = 'Dixon Lab Management System';
	workbook.created = new Date();
	workbook.modified = new Date();

	// Helper to apply borders to cells
	const applyThinBorders = (cell: ExcelJS.Cell) => {
		cell.border = {
			top: { style: 'thin', color: { argb: 'FF000000' } },
			left: { style: 'thin', color: { argb: 'FF000000' } },
			bottom: { style: 'thin', color: { argb: 'FF000000' } },
			right: { style: 'thin', color: { argb: 'FF000000' } }
		};
	};

	// Parse capacity (e.g. 8.0 KG)
	let capacity = '8.0 KG';
	const descLower = (request.sampleDescription || '').toLowerCase();
	const modelLower = (request.modelNo || '').toLowerCase();
	const matchCap = descLower.match(/(\d+(\.\d+)?)\s*(kg|capacity)/) || modelLower.match(/(\d+(\.\d+)?)\s*(kg|capacity)/);
	if (matchCap) {
		capacity = `${matchCap[1]} KG`;
	}

	// ==========================================
	// SHEET 1: Reliability process
	// ==========================================
	const ws1 = workbook.addWorksheet('Reliability process');
	ws1.views = [{ showGridLines: true }];

	// Set column widths
	ws1.columns = [
		{ key: 'colA', width: 28 },
		{ key: 'colB', width: 16 },
		{ key: 'colC', width: 16 },
		{ key: 'colD', width: 16 },
		{ key: 'colE', width: 16 },
		{ key: 'colF', width: 16 },
		{ key: 'colG', width: 16 },
		{ key: 'colH', width: 16 }
	];

	// Top Right Document Metadata
	ws1.mergeCells('E1:H1');
	const metaRow1 = ws1.getCell('E1');
	metaRow1.value = 'Doc. No. - R&D Testing -00400';
	metaRow1.font = { name: 'Arial', size: 9, bold: true };
	metaRow1.alignment = { horizontal: 'right' };

	ws1.mergeCells('E2:H2');
	const metaRow2 = ws1.getCell('E2');
	metaRow2.value = 'Page Number - 01';
	metaRow2.font = { name: 'Arial', size: 9, bold: true };
	metaRow2.alignment = { horizontal: 'right' };

	// Test Condition Banner
	ws1.mergeCells('A4:H6');
	const bannerCell = ws1.getCell('A4');
	bannerCell.value = 'Test condition';
	bannerCell.font = { name: 'Arial', size: 22, bold: true };
	bannerCell.alignment = { horizontal: 'center', vertical: 'middle' };
	bannerCell.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: 'FFE5E7EB' } // light gray
	};
	// Apply borders around merged cell A4:H6
	for (let r = 4; r <= 6; r++) {
		for (let c = 1; c <= 8; c++) {
			applyThinBorders(ws1.getCell(r, c));
		}
	}

	// Test condition details Table (Values are empty as requested)
	const detailsRows = [
		{ label: 'Test Place', val: '' },
		{ label: 'Number Of Samples', val: '' },
		{ label: 'Rated Voltage/ frequency', val: '' },
		{ label: 'Cycle time', val: '' },
		{ label: 'Environmental condition', val: '' }
	];

	let currentWS1Row = 8;
	detailsRows.forEach((rowInfo) => {
		const lblCell = ws1.getCell(`A${currentWS1Row}`);
		lblCell.value = rowInfo.label;
		lblCell.font = { name: 'Arial', size: 10, bold: true };
		lblCell.alignment = { horizontal: 'center', vertical: 'middle' };
		lblCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
		applyThinBorders(lblCell);

		ws1.mergeCells(`B${currentWS1Row}:H${currentWS1Row}`);
		const valCell = ws1.getCell(`B${currentWS1Row}`);
		valCell.value = rowInfo.val;
		valCell.font = { name: 'Arial', size: 10, bold: false };
		valCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
		for (let c = 2; c <= 8; c++) {
			applyThinBorders(ws1.getCell(currentWS1Row, c));
		}
		currentWS1Row++;
	});

	// Reliability Test Sequence Table
	currentWS1Row += 1; // Row 14
	ws1.mergeCells(`A${currentWS1Row}:H${currentWS1Row}`);
	const seqHeader = ws1.getCell(`A${currentWS1Row}`);
	seqHeader.value = 'Reliability test sequence';
	seqHeader.font = { name: 'Arial', size: 11, bold: true };
	seqHeader.alignment = { horizontal: 'center', vertical: 'middle' };
	seqHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
	for (let c = 1; c <= 8; c++) {
		applyThinBorders(ws1.getCell(currentWS1Row, c));
	}
	currentWS1Row++;

	const sequenceRows = [
		{ num: '#1', val: request.testMethodRef || 'Washing Cycles Test' },
		{ num: '#2', val: '' },
		{ num: '#3', val: '' },
		{ num: '#4', val: '' }
	];

	sequenceRows.forEach((seq) => {
		const numCell = ws1.getCell(`A${currentWS1Row}`);
		numCell.value = seq.num;
		numCell.font = { name: 'Arial', size: 10, bold: true };
		numCell.alignment = { horizontal: 'center', vertical: 'middle' };
		numCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
		applyThinBorders(numCell);

		ws1.mergeCells(`B${currentWS1Row}:H${currentWS1Row}`);
		const valCell = ws1.getCell(`B${currentWS1Row}`);
		valCell.value = seq.val;
		valCell.font = { name: 'Arial', size: 10, bold: false };
		valCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
		for (let c = 2; c <= 8; c++) {
			applyThinBorders(ws1.getCell(currentWS1Row, c));
		}
		currentWS1Row++;
	});

	// List to be managed in the Reliability test Table (Values are empty as requested)
	currentWS1Row += 1; // Row 20
	ws1.mergeCells(`A${currentWS1Row}:H${currentWS1Row}`);
	const manageHeader = ws1.getCell(`A${currentWS1Row}`);
	manageHeader.value = 'List to be managed in the Reliability test';
	manageHeader.font = { name: 'Arial', size: 11, bold: true };
	manageHeader.alignment = { horizontal: 'center', vertical: 'middle' };
	manageHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Light green
	for (let c = 1; c <= 8; c++) {
		applyThinBorders(ws1.getCell(currentWS1Row, c));
	}
	currentWS1Row++;

	const manageRows = [
		{ label: 'Cleaning lint', val: '' },
		{ label: 'Water in washing tub', val: '' }
	];

	manageRows.forEach((rowInfo) => {
		const lblCell = ws1.getCell(`A${currentWS1Row}`);
		lblCell.value = rowInfo.label;
		lblCell.font = { name: 'Arial', size: 10, bold: true };
		lblCell.alignment = { horizontal: 'center', vertical: 'middle' };
		lblCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
		applyThinBorders(lblCell);

		ws1.mergeCells(`B${currentWS1Row}:H${currentWS1Row}`);
		const valCell = ws1.getCell(`B${currentWS1Row}`);
		valCell.value = rowInfo.val;
		valCell.font = { name: 'Arial', size: 10, bold: false };
		valCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
		for (let c = 2; c <= 8; c++) {
			applyThinBorders(ws1.getCell(currentWS1Row, c));
		}
		currentWS1Row++;
	});

	// Tear Down Table (Cycle and process values are empty. Judgement criteria from testProtocol)
	currentWS1Row += 1; // Row 24
	ws1.mergeCells(`A${currentWS1Row}:H${currentWS1Row}`);
	const tdHeader = ws1.getCell(`A${currentWS1Row}`);
	tdHeader.value = 'Tear Down';
	tdHeader.font = { name: 'Arial', size: 11, bold: true };
	tdHeader.alignment = { horizontal: 'center', vertical: 'middle' };
	tdHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
	for (let c = 1; c <= 8; c++) {
		applyThinBorders(ws1.getCell(currentWS1Row, c));
	}
	currentWS1Row++;

	const protocolJudgementCriteria = plan.testProtocol?.judgementCriteria || '';

	const tdRows = [
		{ label: 'Cycle', val: '' },
		{ label: 'Process', val: '' },
		{ label: 'Judement criteria', val: protocolJudgementCriteria }
	];

	tdRows.forEach((rowInfo) => {
		const lblCell = ws1.getCell(`A${currentWS1Row}`);
		lblCell.value = rowInfo.label;
		lblCell.font = { name: 'Arial', size: 10, bold: true };
		lblCell.alignment = { horizontal: 'center', vertical: 'middle' };
		lblCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
		applyThinBorders(lblCell);

		ws1.mergeCells(`B${currentWS1Row}:H${currentWS1Row}`);
		const valCell = ws1.getCell(`B${currentWS1Row}`);
		valCell.value = rowInfo.val;
		valCell.font = { name: 'Arial', size: 10, bold: false };
		valCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
		for (let c = 2; c <= 8; c++) {
			applyThinBorders(ws1.getCell(currentWS1Row, c));
		}
		currentWS1Row++;
	});

	// ==========================================
	// SHEET 2: Reliability check point
	// ==========================================
	const ws2 = workbook.addWorksheet('Reliability check point');
	ws2.views = [{ showGridLines: true }];

	ws2.columns = [
		{ key: 'sr', width: 10 },
		{ key: 'part', width: 22 },
		{ key: 'criteria', width: 36 },
		{ key: 'judgement', width: 16 },
		{ key: 'remarks', width: 26 }
	];

	// Top Right Doc info
	ws2.mergeCells('C1:E1');
	const ws2MetaRow1 = ws2.getCell('C1');
	ws2MetaRow1.value = 'Doc. No. - R&D Testing - 004';
	ws2MetaRow1.font = { name: 'Arial', size: 9, bold: true };
	ws2MetaRow1.alignment = { horizontal: 'right' };

	ws2.mergeCells('C2:E2');
	const ws2MetaRow2 = ws2.getCell('C2');
	ws2MetaRow2.value = 'Page Number - 02';
	ws2MetaRow2.font = { name: 'Arial', size: 9, bold: true };
	ws2MetaRow2.alignment = { horizontal: 'right' };

	// Test Condition Side Table (loads, voltage, frequency, cycles completed are empty as requested)
	ws2.mergeCells('A4:B4');
	const tcHeader = ws2.getCell('A4');
	tcHeader.value = 'Test Condition:-';
	tcHeader.font = { name: 'Arial', size: 10, bold: true };
	tcHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
	applyThinBorders(tcHeader);
	applyThinBorders(ws2.getCell('B4'));

	ws2.mergeCells('C4:E4');
	applyThinBorders(ws2.getCell('C4'));
	applyThinBorders(ws2.getCell('D4'));
	applyThinBorders(ws2.getCell('E4'));

	const condRows = [
		{ key: 'Start date', val: plan.startDate || '' },
		{ key: 'End date', val: plan.endDate || '' },
		{ key: 'Rated Load', val: '' },
		{ key: 'Rated voltage', val: '' },
		{ key: 'Rated frequency', val: '' },
		{ key: 'Cycle completed', val: '' }
	];

	let currentWS2Row = 5;
	condRows.forEach(item => {
		const lblCell = ws2.getCell(`A${currentWS2Row}`);
		lblCell.value = item.key;
		lblCell.font = { name: 'Arial', size: 9, bold: true };
		applyThinBorders(lblCell);

		ws2.mergeCells(`B${currentWS2Row}:E${currentWS2Row}`);
		const valCell = ws2.getCell(`B${currentWS2Row}`);
		valCell.value = item.val;
		valCell.font = { name: 'Arial', size: 9, bold: false };
		valCell.alignment = { horizontal: 'left', indent: 1 };
		for (let c = 2; c <= 5; c++) {
			applyThinBorders(ws2.getCell(currentWS2Row, c));
		}
		currentWS2Row++;
	});

	// Disclaimer text banner
	currentWS2Row += 1; // Row 12
	ws2.mergeCells(`A${currentWS2Row}:E${currentWS2Row}`);
	const disBanner = ws2.getCell(`A${currentWS2Row}`);
	disBanner.value = 'After Dismental all test samples set check all below item:-';
	disBanner.font = { name: 'Arial', size: 10, bold: true };
	disBanner.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
	disBanner.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
	for (let c = 1; c <= 5; c++) {
		applyThinBorders(ws2.getCell(currentWS2Row, c));
	}
	currentWS2Row++;

	// Table Checklist Header
	currentWS2Row += 1; // Row 14
	const headers = [
		{ col: 'A', val: 'Sr. no.' },
		{ col: 'B', val: 'Set 1' },
		{ col: 'C', val: 'Judgement criteria' },
		{ col: 'D', val: 'Judgement' },
		{ col: 'E', val: 'Remarks' }
	];
	headers.forEach(h => {
		const cell = ws2.getCell(`${h.col}${currentWS2Row}`);
		cell.value = h.val;
		cell.font = { name: 'Arial', size: 9, bold: true };
		cell.alignment = { horizontal: 'center', vertical: 'middle' };
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
		applyThinBorders(cell);
	});
	currentWS2Row++;

	// Checklist Items - 17 items (Set 1 values/Part, Judgement criteria, Judgement, Remarks are empty as requested)
	for (let idx = 0; idx < 17; idx++) {
		const srCell = ws2.getCell(`A${currentWS2Row}`);
		srCell.value = idx + 1;
		srCell.font = { name: 'Arial', size: 9 };
		srCell.alignment = { horizontal: 'center' };
		applyThinBorders(srCell);

		const partCell = ws2.getCell(`B${currentWS2Row}`);
		partCell.value = '';
		applyThinBorders(partCell);

		const critCell = ws2.getCell(`C${currentWS2Row}`);
		critCell.value = '';
		applyThinBorders(critCell);

		const judgeCell = ws2.getCell(`D${currentWS2Row}`);
		judgeCell.value = '';
		applyThinBorders(judgeCell);

		const remCell = ws2.getCell(`E${currentWS2Row}`);
		remCell.value = '';
		applyThinBorders(remCell);

		currentWS2Row++;
	}

	// Error Codings Table at bottom
	currentWS2Row += 1;
	ws2.mergeCells(`A${currentWS2Row}:E${currentWS2Row}`);
	const errHeader = ws2.getCell(`A${currentWS2Row}`);
	errHeader.value = 'Error Coding details';
	errHeader.font = { name: 'Arial', size: 10, bold: true };
	errHeader.alignment = { horizontal: 'center' };
	errHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
	for (let c = 1; c <= 5; c++) {
		applyThinBorders(ws2.getCell(currentWS2Row, c));
	}
	currentWS2Row++;

	// Error Codings columns
	const srErr = ws2.getCell(`A${currentWS2Row}`);
	srErr.value = 'Sl. No.';
	srErr.font = { name: 'Arial', size: 9, bold: true };
	srErr.alignment = { horizontal: 'center' };
	applyThinBorders(srErr);

	ws2.mergeCells(`B${currentWS2Row}:E${currentWS2Row}`);
	const descErr = ws2.getCell(`B${currentWS2Row}`);
	descErr.value = 'Error Codings';
	descErr.font = { name: 'Arial', size: 9, bold: true };
	descErr.alignment = { horizontal: 'center' };
	for (let c = 2; c <= 5; c++) {
		applyThinBorders(ws2.getCell(currentWS2Row, c));
	}
	currentWS2Row++;

	// E0 to E6 Rows
	const errorsList = ['E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
	errorsList.forEach((errCode, idx) => {
		const slCell = ws2.getCell(`A${currentWS2Row}`);
		slCell.value = idx + 1;
		slCell.font = { name: 'Arial', size: 9 };
		slCell.alignment = { horizontal: 'center' };
		applyThinBorders(slCell);

		ws2.mergeCells(`B${currentWS2Row}:E${currentWS2Row}`);
		const codCell = ws2.getCell(`B${currentWS2Row}`);
		codCell.value = errCode;
		codCell.font = { name: 'Arial', size: 9, bold: true };
		codCell.alignment = { horizontal: 'center' };
		for (let c = 2; c <= 5; c++) {
			applyThinBorders(ws2.getCell(currentWS2Row, c));
		}
		currentWS2Row++;
	});

	// ==========================================
	// SHEET 3: Tear down sheet 1
	// ==========================================
	const ws3 = workbook.addWorksheet('Tear down sheet 1');
	ws3.views = [{ showGridLines: true }];

	// Set 1 to 5 columns are made larger (width 32) to facilitate adding images
	ws3.columns = [
		{ key: 'sr', width: 8 },
		{ key: 'part', width: 22 },
		{ key: 'qty', width: 14 },
		{ key: 'set1', width: 32 },
		{ key: 'set2', width: 32 },
		{ key: 'set3', width: 32 },
		{ key: 'set4', width: 32 },
		{ key: 'set5', width: 32 },
		{ key: 'abnormality', width: 16 },
		{ key: 'remarks', width: 20 }
	];

	// Top Right Doc Info
	ws3.mergeCells('H1:J1');
	const ws3MetaRow1 = ws3.getCell('H1');
	ws3MetaRow1.value = 'Doc. No. - R&D Testing -004';
	ws3MetaRow1.font = { name: 'Arial', size: 9, bold: true };
	ws3MetaRow1.alignment = { horizontal: 'right' };

	ws3.mergeCells('H2:J2');
	const ws3MetaRow2 = ws3.getCell('H2');
	ws3MetaRow2.value = 'Page Number - 03';
	ws3MetaRow2.font = { name: 'Arial', size: 9, bold: true };
	ws3MetaRow2.alignment = { horizontal: 'right' };

	// Merged title header
	ws3.mergeCells('A4:J4');
	const titleCell3 = ws3.getCell('A4');
	titleCell3.value = `Reliability Set Tear Down (${capacity}) Report`;
	titleCell3.font = { name: 'Arial', size: 14, bold: true };
	titleCell3.alignment = { horizontal: 'center', vertical: 'middle' };
	titleCell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
	for (let c = 1; c <= 10; c++) {
		applyThinBorders(ws3.getCell(4, c));
	}

	// Table Headers
	const headersSheet3 = [
		{ col: 'A', val: 'Sr. No.', color: 'FFE5E7EB' },
		{ col: 'B', val: 'Part', color: 'FFE5E7EB' },
		{ col: 'C', val: 'Quantity/ set', color: 'FFE5E7EB' },
		{ col: 'D', val: 'Set 1', color: 'FFFED7AA' }, // Peach
		{ col: 'E', val: 'Set 2', color: 'FFFED7AA' },
		{ col: 'F', val: 'Set 3', color: 'FFFED7AA' },
		{ col: 'G', val: 'Set 4', color: 'FFFED7AA' },
		{ col: 'H', val: 'Set 5', color: 'FFFED7AA' },
		{ col: 'I', val: 'Abnormality', color: 'FFE5E7EB' },
		{ col: 'J', val: 'Remarks', color: 'FFE5E7EB' }
	];

	headersSheet3.forEach(h => {
		const cell = ws3.getCell(`${h.col}6`);
		cell.value = h.val;
		cell.font = { name: 'Arial', size: 9, bold: true };
		cell.alignment = { horizontal: 'center', vertical: 'middle' };
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: h.color } };
		applyThinBorders(cell);
	});

	// Rows 1 to 20 are created with empty values as requested. Row height set to 80 for adding images.
	for (let index = 0; index < 20; index++) {
		const rNum = 7 + index;
		ws3.getRow(rNum).height = 80;

		const srCell = ws3.getCell(`A${rNum}`);
		srCell.value = index + 1;
		srCell.alignment = { horizontal: 'center', vertical: 'middle' };
		applyThinBorders(srCell);

		const partCell = ws3.getCell(`B${rNum}`);
		partCell.value = '';
		applyThinBorders(partCell);

		const qtyCell = ws3.getCell(`C${rNum}`);
		qtyCell.value = '';
		applyThinBorders(qtyCell);

		['D', 'E', 'F', 'G', 'H'].forEach(col => {
			const setCell = ws3.getCell(`${col}${rNum}`);
			setCell.value = '';
			applyThinBorders(setCell);
		});

		const abnCell = ws3.getCell(`I${rNum}`);
		abnCell.value = '';
		applyThinBorders(abnCell);

		const remCell = ws3.getCell(`J${rNum}`);
		remCell.value = '';
		applyThinBorders(remCell);
	}

	// ==========================================
	// SHEET 4: Tear down sheet 2
	// ==========================================
	const ws4 = workbook.addWorksheet('Tear down sheet 2');
	ws4.views = [{ showGridLines: true }];

	ws4.columns = ws3.columns; // Share columns layout and larger widths

	// Top Right Doc Info
	ws4.mergeCells('H1:J1');
	const ws4MetaRow1 = ws4.getCell('H1');
	ws4MetaRow1.value = 'Doc. No. - R&D Testing -004';
	ws4MetaRow1.font = { name: 'Arial', size: 9, bold: true };
	ws4MetaRow1.alignment = { horizontal: 'right' };

	ws4.mergeCells('H2:J2');
	const ws4MetaRow2 = ws4.getCell('H2');
	ws4MetaRow2.value = 'Page Number - 04';
	ws4MetaRow2.font = { name: 'Arial', size: 9, bold: true };
	ws4MetaRow2.alignment = { horizontal: 'right' };

	// Merged title header
	ws4.mergeCells('A4:J4');
	const titleCell4 = ws4.getCell('A4');
	titleCell4.value = `Reliability Set Tear Down (${capacity}) Report`;
	titleCell4.font = { name: 'Arial', size: 14, bold: true };
	titleCell4.alignment = { horizontal: 'center', vertical: 'middle' };
	titleCell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
	for (let c = 1; c <= 10; c++) {
		applyThinBorders(ws4.getCell(4, c));
	}

	// Table Headers
	headersSheet3.forEach(h => {
		const cell = ws4.getCell(`${h.col}6`);
		cell.value = h.val;
		cell.font = { name: 'Arial', size: 9, bold: true };
		cell.alignment = { horizontal: 'center', vertical: 'middle' };
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: h.color } };
		applyThinBorders(cell);
	});

	// Rows 21 to 30 are created with empty values as requested. Row height set to 80.
	for (let index = 0; index < 10; index++) {
		const rNum = 7 + index;
		ws4.getRow(rNum).height = 80;

		const srCell = ws4.getCell(`A${rNum}`);
		srCell.value = 21 + index;
		srCell.alignment = { horizontal: 'center', vertical: 'middle' };
		applyThinBorders(srCell);

		const partCell = ws4.getCell(`B${rNum}`);
		partCell.value = '';
		applyThinBorders(partCell);

		const qtyCell = ws4.getCell(`C${rNum}`);
		qtyCell.value = '';
		applyThinBorders(qtyCell);

		['D', 'E', 'F', 'G', 'H'].forEach(col => {
			const setCell = ws4.getCell(`${col}${rNum}`);
			setCell.value = '';
			applyThinBorders(setCell);
		});

		const abnCell = ws4.getCell(`I${rNum}`);
		abnCell.value = '';
		applyThinBorders(abnCell);

		const remCell = ws4.getCell(`J${rNum}`);
		remCell.value = '';
		applyThinBorders(remCell);
	}

	// Return generated buffer
	const buffer = await workbook.xlsx.writeBuffer();
	return buffer as any;
}