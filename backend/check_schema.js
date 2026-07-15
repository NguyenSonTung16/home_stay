const { Pool } = require('pg');
const fs = require('fs');

async function check() {
  const pool = new Pool({user:'postgres',host:'localhost',database:'home_stay',password:'16102005',port:5433});
  
  const dbSchema = {};
  const res = await pool.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public'");
  res.rows.forEach(r => {
    if (!dbSchema[r.table_name]) dbSchema[r.table_name] = [];
    dbSchema[r.table_name].push(r.column_name.toLowerCase());
  });
  await pool.end();

  const xml = fs.readFileSync('d:/vscode/home_stay/luoc_do_csdl.xml', 'utf-8');
  
  const xmlSchema = {};
  const tblRegex = /<mxCell id=\"tbl_([a-z0-9_]+)\" .*? value=\"(.*?)\"/g;
  let match;
  const idToName = {};
  while ((match = tblRegex.exec(xml)) !== null) {
    const tblId = match[1];
    let tableName = tblId;
    if (tblId === 'tk') tableName = 'taikhoan';
    if (tblId === 'nv') tableName = 'nhanvien';
    if (tblId === 'kh') tableName = 'khachhang';
    if (tblId === 'hd') tableName = 'hopdong';
    if (tblId === 'pdkh') tableName = 'phieudangkyhen';
    if (tblId === 'tvt') tableName = 'thanhvienthue';
    if (tblId === 'pdc') tableName = 'phieudatcoc';
    if (tblId === 'yctp') tableName = 'yeucautraphong';
    if (tblId === 'pktp') tableName = 'phieukiemtraphong';
    if (tblId === 'bds') tableName = 'bangdoisoat';
    if (tblId === 'lp') tableName = 'loaiphong';
    if (tblId === 'p') tableName = 'phong';
    if (tblId === 'g') tableName = 'giuong';
    if (tblId === 'ctg') tableName = 'chitietgiuong';
    if (tblId === 'hddk') tableName = 'hoadondinhky';
    if (tblId === 'dvp') tableName = 'dichvuphong';
    if (tblId === 'ctdvp') tableName = 'chitietdichvuphong';
    if (tblId === 'csdn') tableName = 'chisodiennuoc';
    if (tblId === 'dvk') tableName = 'dichvukhac';
    if (tblId === 'ctdv') tableName = 'chitietdichvu';
    if (tblId === 'lsg') tableName = 'lichsugiadichvu';
    if (tblId === 'ctlh') tableName = 'ct_lichhen';
    if (tblId === 'hddn') tableName = 'hoadondiennuoc';
    if (tblId === 'hdpdk') tableName = 'hoadonphidinhky';
    if (tblId === 'dh') tableName = 'donhang';
    if (tblId === 'ctxldc') tableName = 'chitietxulydatcoc';

    idToName['tbl_'+tblId] = tableName;
    xmlSchema[tableName] = [];
  }

  const colRegex = /<mxCell id=\"col_([a-z0-9_]+)_([a-z0-9_]+)\" parent=\"(tbl_[a-z0-9_]+)\" .*? value=\"(.*?)\"/g;
  while ((match = colRegex.exec(xml)) !== null) {
    const parentTbl = match[3];
    const rawVal = match[4];
    let colName = rawVal.replace(/&lt;.*?&gt;/g, '').replace(/<.*?>/g, '').split('(')[0].trim().toLowerCase();
    colName = colName.replace(/\s+/g, '');
    
    // Map XML column names to match DB exactly in some cases
    if (colName === 'macoc_fk') colName = 'macoc';
    if (colName === 'makh_fk') colName = 'makh';
    if (colName === 'manv_fk') colName = 'manv';
    if (colName === 'maphong_fk') colName = 'maphong';
    if (colName === 'mahd_fk') colName = 'mahd';
    if (colName === 'maloai_fk') colName = 'maloai';
    if (colName === 'madvp_fk') colName = 'madvp';
    if (colName === 'madichvu_fk') colName = 'madichvu';
    if (colName === 'magiuong_fk') colName = 'magiuong';
    if (colName === 'maphieu_fk') colName = 'maphieu';
    if (colName === 'tghh') colName = 'thoigianhethan';
    if (colName === 'tgxn') colName = 'thoigianxacnhan';
    if (colName === 'trangthaistr') colName = 'trangthaistr';
    
    const tableName = idToName[parentTbl];
    if (tableName) {
      xmlSchema[tableName].push(colName);
    }
  }

  for (const t of Object.keys(dbSchema)) {
    if (xmlSchema[t]) {
      const dbCols = new Set(dbSchema[t]);
      const xmlCols = new Set(xmlSchema[t]);
      
      const missingInXml = [...dbCols].filter(c => !xmlCols.has(c));
      const extraInXml = [...xmlCols].filter(c => !dbCols.has(c));
      
      if (missingInXml.length > 0 || extraInXml.length > 0) {
        console.log(`Table ${t} mismatches:`);
        if (missingInXml.length > 0) console.log(`  Missing in XML: ${missingInXml.join(', ')}`);
        if (extraInXml.length > 0) console.log(`  Extra in XML: ${extraInXml.join(', ')}`);
      }
    }
  }
}

check().catch(console.error);
