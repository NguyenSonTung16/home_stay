const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'luoc_do_csdl.xml');
let xml = fs.readFileSync(filePath, 'utf-8');

// 1. Thêm Email vào Khách hàng
// Tìm geometry của tbl_kh
xml = xml.replace(
  /<mxCell id="tbl_kh"([\s\S]*?)<mxGeometry height="270"/g,
  '<mxCell id="tbl_kh"$1<mxGeometry height="300"'
);
const colKhEmail = `
    <mxCell id="col_kh_email" parent="tbl_kh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Email (NVARCHAR(100))" vertex="1">
      <mxGeometry height="30" width="180" y="270" as="geometry" />
    </mxCell>`;
xml = xml.replace(/(<mxCell id="col_kh_stk"[\s\S]*?<\/mxCell>)/, '$1' + colKhEmail);


// 2. Thêm Hình ảnh vào Phòng
xml = xml.replace(
  /<mxCell id="tbl_p"([\s\S]*?)<mxGeometry height="210"/g,
  '<mxCell id="tbl_p"$1<mxGeometry height="240"'
);
const colPHinhanh = `
    <mxCell id="col_p_hinhanh" parent="tbl_p" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Hình ảnh (NVARCHAR(255))" vertex="1">
      <mxGeometry height="30" width="180" y="210" as="geometry" />
    </mxCell>`;
xml = xml.replace(/(<mxCell id="col_p_gioitinh"[\s\S]*?<\/mxCell>)/, '$1' + colPHinhanh);


// 3. Xóa DS phòng xem trong Phiếu đăng ký hẹn
xml = xml.replace(
  /<mxCell id="tbl_pdkh"([\s\S]*?)<mxGeometry height="270"/g,
  '<mxCell id="tbl_pdkh"$1<mxGeometry height="240"'
);
xml = xml.replace(/<mxCell id="col_pdkh_dsphong"[\s\S]*?<\/mxCell>/g, '');


// 4. Thêm các bảng mới
const newTables = `
    <mxCell id="tbl_ctlh" parent="1" style="swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" value="Chi tiết lịch hẹn" vertex="1">
      <mxGeometry height="90" width="180" x="100" y="900" as="geometry" />
    </mxCell>
    <mxCell id="col_ctlh_maphieu_fk" parent="tbl_ctlh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#FF0000;" value="&lt;u&gt;Mã Phiếu (INT)&lt;/u&gt;" vertex="1">
      <mxGeometry height="30" width="180" y="30" as="geometry" />
    </mxCell>
    <mxCell id="col_ctlh_maphong_fk" parent="tbl_ctlh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#FF0000;" value="&lt;u&gt;Mã Phòng (INT)&lt;/u&gt;" vertex="1">
      <mxGeometry height="30" width="180" y="60" as="geometry" />
    </mxCell>

    <mxCell id="tbl_hddn" parent="1" style="swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" value="Hóa đơn điện nước" vertex="1">
      <mxGeometry height="360" width="180" x="1200" y="0" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_mahddn" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="&lt;u&gt;Mã HĐĐN (INT)&lt;/u&gt;" vertex="1">
      <mxGeometry height="30" width="180" y="30" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_maphong_fk" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#FF0000;" value="Mã Phòng (INT)" vertex="1">
      <mxGeometry height="30" width="180" y="60" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_thang" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tháng (NVARCHAR(7))" vertex="1">
      <mxGeometry height="30" width="180" y="90" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_csdiencu" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="CS điện cũ (INT)" vertex="1">
      <mxGeometry height="30" width="180" y="120" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_csdienmoi" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="CS điện mới (INT)" vertex="1">
      <mxGeometry height="30" width="180" y="150" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_csnuoccu" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="CS nước cũ (INT)" vertex="1">
      <mxGeometry height="30" width="180" y="180" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_csnuocmoi" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="CS nước mới (INT)" vertex="1">
      <mxGeometry height="30" width="180" y="210" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_tiendien" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tiền điện (DECIMAL)" vertex="1">
      <mxGeometry height="30" width="180" y="240" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_tiennuoc" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tiền nước (DECIMAL)" vertex="1">
      <mxGeometry height="30" width="180" y="270" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_tongtien" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tổng tiền (DECIMAL)" vertex="1">
      <mxGeometry height="30" width="180" y="300" as="geometry" />
    </mxCell>
    <mxCell id="col_hddn_trangthai" parent="tbl_hddn" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Trạng thái (NVARCHAR(20))" vertex="1">
      <mxGeometry height="30" width="180" y="330" as="geometry" />
    </mxCell>

    <mxCell id="tbl_hdpdk" parent="1" style="swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" value="Hóa đơn phí định kỳ" vertex="1">
      <mxGeometry height="240" width="180" x="1200" y="380" as="geometry" />
    </mxCell>
    <mxCell id="col_hdpdk_mapdk" parent="tbl_hdpdk" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="&lt;u&gt;Mã PĐK (INT)&lt;/u&gt;" vertex="1">
      <mxGeometry height="30" width="180" y="30" as="geometry" />
    </mxCell>
    <mxCell id="col_hdpdk_mahd_fk" parent="tbl_hdpdk" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;fontColor=#FF0000;" value="Mã HĐ (INT)" vertex="1">
      <mxGeometry height="30" width="180" y="60" as="geometry" />
    </mxCell>
    <mxCell id="col_hdpdk_thang" parent="tbl_hdpdk" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tháng (NVARCHAR(7))" vertex="1">
      <mxGeometry height="30" width="180" y="90" as="geometry" />
    </mxCell>
    <mxCell id="col_hdpdk_tienphong" parent="tbl_hdpdk" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tiền phòng (DECIMAL)" vertex="1">
      <mxGeometry height="30" width="180" y="120" as="geometry" />
    </mxCell>
    <mxCell id="col_hdpdk_tiendichvu" parent="tbl_hdpdk" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tiền dịch vụ (DECIMAL)" vertex="1">
      <mxGeometry height="30" width="180" y="150" as="geometry" />
    </mxCell>
    <mxCell id="col_hdpdk_tongtien" parent="tbl_hdpdk" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tổng tiền (DECIMAL)" vertex="1">
      <mxGeometry height="30" width="180" y="180" as="geometry" />
    </mxCell>
    <mxCell id="col_hdpdk_trangthai" parent="tbl_hdpdk" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Trạng thái (NVARCHAR(20))" vertex="1">
      <mxGeometry height="30" width="180" y="210" as="geometry" />
    </mxCell>

    <mxCell id="tbl_dh" parent="1" style="swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;" value="Đơn hàng" vertex="1">
      <mxGeometry height="300" width="180" x="1200" y="650" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_madh" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="&lt;u&gt;Mã ĐH (NVARCHAR(100))&lt;/u&gt;" vertex="1">
      <mxGeometry height="30" width="180" y="30" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_loaihoadon" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Loại hóa đơn (NVARCHAR)" vertex="1">
      <mxGeometry height="30" width="180" y="60" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_phuongthuc" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Phương thức (NVARCHAR)" vertex="1">
      <mxGeometry height="30" width="180" y="90" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_tongtien" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Tổng tiền (DECIMAL)" vertex="1">
      <mxGeometry height="30" width="180" y="120" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_mahoadon" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Mã hóa đơn (INT)" vertex="1">
      <mxGeometry height="30" width="180" y="150" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_trangthai" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Trạng thái (NVARCHAR(20))" vertex="1">
      <mxGeometry height="30" width="180" y="180" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_thoigianhethan" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Thời gian hết hạn (DATETIME)" vertex="1">
      <mxGeometry height="30" width="180" y="210" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_idempotency" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="IdempotencyKey (NVARCHAR)" vertex="1">
      <mxGeometry height="30" width="180" y="240" as="geometry" />
    </mxCell>
    <mxCell id="col_dh_ngaytao" parent="tbl_dh" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;" value="Ngày tạo (DATETIME)" vertex="1">
      <mxGeometry height="30" width="180" y="270" as="geometry" />
    </mxCell>

    <mxCell id="edge_ctlh_pdkh" edge="1" parent="1" source="col_ctlh_maphieu_fk" target="col_pdkh_maphieu">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
          <mxPoint x="40" y="945" />
          <mxPoint x="40" y="645" />
        </Array>
      </mxGeometry>
    </mxCell>
    <mxCell id="edge_ctlh_p" edge="1" parent="1" source="col_ctlh_maphong_fk" target="col_p_maphong">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
          <mxPoint x="400" y="975" />
          <mxPoint x="400" y="275" />
        </Array>
      </mxGeometry>
    </mxCell>
    <mxCell id="edge_hddn_p" edge="1" parent="1" source="col_hddn_maphong_fk" target="col_p_maphong">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
          <mxPoint x="1100" y="75" />
          <mxPoint x="1100" y="275" />
        </Array>
      </mxGeometry>
    </mxCell>
    <mxCell id="edge_hdpdk_hd" edge="1" parent="1" source="col_hdpdk_mahd_fk" target="col_hd_mahd">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
          <mxPoint x="1150" y="455" />
          <mxPoint x="1150" y="305" />
        </Array>
      </mxGeometry>
    </mxCell>
`;

xml = xml.replace(/(<\/root>)/, newTables + '\n  $1');

fs.writeFileSync(filePath, xml, 'utf-8');
console.log('XML updated successfully!');
