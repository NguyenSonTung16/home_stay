const fs = require('fs');
let xml = fs.readFileSync('d:/vscode/home_stay/luoc_do_csdl.xml', 'utf-8');

// The edges we want to fix:
// edge_ctlh_pdkh
// edge_ctlh_p
// edge_hddn_p
// edge_hdpdk_hd
// edge_ctxldc_pdc

const edgesToFix = [
  {id: 'edge_ctlh_pdkh', source: 'col_ctlh_maphieu_fk', target: 'col_pdkh_maphieu'},
  {id: 'edge_ctlh_p', source: 'col_ctlh_maphong_fk', target: 'col_p_maphong'},
  {id: 'edge_hddn_p', source: 'col_hddn_maphong_fk', target: 'col_p_maphong'},
  {id: 'edge_hdpdk_hd', source: 'col_hdpdk_mahd_fk', target: 'col_hd_mahd'},
  {id: 'edge_ctxldc_pdc', source: 'col_ctxldc_macoc_fk', target: 'col_pdc_macoc'}
];

for (const edge of edgesToFix) {
  const findRegex = new RegExp(`<mxCell id="${edge.id}" edge="1" parent="1" source="${edge.source}" target="${edge.target}">`, 'g');
  const replacement = `<mxCell id="${edge.id}" edge="1" parent="1" source="${edge.source}" target="${edge.target}" style="rounded=1;html=1;startArrow=ERoneToMany;endArrow=ERmandOne;">`;
  xml = xml.replace(findRegex, replacement);
}

fs.writeFileSync('d:/vscode/home_stay/luoc_do_csdl.xml', xml);
console.log('Fixed edges successfully!');
