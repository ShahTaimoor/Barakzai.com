import{r as x,u as de,R as X,a3 as pe,a4 as xe,a5 as me,a6 as he,a7 as ue,a8 as ge,a9 as be,aa as ye,p as e,O as fe,S as je,a2 as Ne,C as ve,B as Y,z as we,y as Ie}from"./index-Cw3xRKpc.js";import{g as Se}from"./ComponentRegistry-Bivjkut0.js";import{P as De}from"./plus-DxsvPhf3.js";import{F as Me}from"./filter-bwJnrGXq.js";import{E as Ce}from"./eye-DISpb38e.js";import{P as H}from"./printer-Bdyt47kH.js";import{P as Pe}from"./pen-square-XPG_rn4Q.js";import{T as $e}from"./trash-2-D2rrIU_x.js";import{X as K}from"./x-circle-MQqDWFsw.js";import{C as I}from"./check-circle-C7396OEq.js";const Te=({status:p})=>{const j={draft:{color:"bg-gray-100 text-gray-800",icon:ve,label:"Draft"},confirmed:{color:"bg-blue-100 text-blue-800",icon:I,label:"Confirmed"},received:{color:"bg-green-100 text-green-800",icon:I,label:"Received"},paid:{color:"bg-green-100 text-green-800",icon:I,label:"Paid"},cancelled:{color:"bg-red-100 text-red-800",icon:K,label:"Cancelled"},closed:{color:"bg-gray-100 text-gray-800",icon:K,label:"Closed"}},l=j[p]||j.draft,v=l.icon;return e.jsxs("span",{className:`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${l.color}`,children:[e.jsx(v,{className:"h-3 w-3 mr-1"}),l.label]})},He=()=>{var P,$,T,A,k,E,F,L,R,z,O,V,_;const[p,j]=x.useState(""),[l,v]=x.useState(""),[m,W]=x.useState(new Date(Date.now()-30*24*60*60*1e3).toISOString().split("T")[0]),[h,Z]=x.useState(new Date().toISOString().split("T")[0]),[a,ee]=x.useState(null),[te,S]=x.useState(!1),{openTab:se}=de(),ae=X.useMemo(()=>{const t={search:p||void 0,status:l||void 0};return m&&(t.dateFrom=m),h&&(t.dateTo=h),t},[p,l,m,h]),{data:r,isLoading:re,error:ne,refetch:D}=pe(ae,{refetchOnMountOrArgChange:!0}),[Ae,{isLoading:ke}]=xe(),[ie,{isLoading:Ee}]=me(),[Fe]=he(),[Le]=ue(),[Re]=ge(),[ze]=be(),[Oe]=ye(),M=t=>{var d,u,g,b,y,f,q,U,G,Q,B,J;if(!t)return;const n=window.open("","_blank");if(!n)return;const s=o=>o?String(o).replace(/[&<>"']/g,N=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[N]):"",i=(t.items||[]).map(o=>{var N,w;return`
      <tr>
        <td class="border border-gray-300 px-4 py-2">${s(((N=o.product)==null?void 0:N.name)||"Unknown Product")}</td>
        <td class="border border-gray-300 px-4 py-2">${s(((w=o.product)==null?void 0:w.description)||"")}</td>
        <td class="border border-gray-300 px-4 py-2 text-right">${o.quantity||0}</td>
        <td class="border border-gray-300 px-4 py-2 text-right">${Math.round(o.unitCost||0)}</td>
        <td class="border border-gray-300 px-4 py-2 text-right">${Math.round(o.totalCost||0)}</td>
      </tr>
    `}).join("")||`
      <tr>
        <td colspan="5" class="border border-gray-300 px-4 py-2 text-center text-gray-500">No items found</td>
      </tr>
    `,c=`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Purchase Invoice ${s(t.invoiceNumber)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #111827; }
    .header { text-align: center; margin-bottom: 30px; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .invoice-type { font-size: 18px; color: #6b7280; }
    .invoice-details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .supplier-info, .invoice-info, .payment-info { width: 100%; }
    .invoice-info, .payment-info { text-align: right; }
    .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; font-size: 14px; }
    .section-content { font-size: 14px; }
    .section-content p { margin: 4px 0; }
    .font-medium { font-weight: 500; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th, .items-table td { border: 1px solid #ccc; padding: 8px; }
    .items-table th { background-color: #f5f5f5; font-weight: bold; text-align: left; }
    .items-table .text-right { text-align: right; }
    .border { border: 1px solid #ccc; }
    .border-gray-300 { border-color: #ccc; }
    .px-4 { padding-left: 16px; padding-right: 16px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-gray-500 { color: #6b7280; }
    .totals { margin-left: auto; width: 300px; }
    .totals table { width: 100%; }
    .totals td { padding: 5px 10px; font-size: 14px; }
    .totals .total-row { font-weight: bold; }
    .totals .total-row td { border-top: 2px solid #000; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">Your Company Name</div>
    <div class="invoice-type">Purchase Invoice</div>
  </div>
  
  <div class="invoice-details">
    <div class="supplier-info">
      <div class="section-title">Supplier Details:</div>
      <div class="section-content">
        <p style="font-weight: 500;">${s(((d=t.supplierInfo)==null?void 0:d.companyName)||((u=t.supplierInfo)==null?void 0:u.name)||"Unknown Supplier")}</p>
        <p>${s(((g=t.supplierInfo)==null?void 0:g.email)||"")}</p>
        <p>${s(((b=t.supplierInfo)==null?void 0:b.phone)||"")}</p>
        <p>${s(((y=t.supplierInfo)==null?void 0:y.address)||"")}</p>
      </div>
    </div>
    <div class="invoice-info">
      <div class="section-title">Invoice Details:</div>
      <div class="section-content">
        <p><span class="font-medium">Invoice #:</span> ${s(t.invoiceNumber)}</p>
        <p><span class="font-medium">Date:</span> ${new Date(t.createdAt).toLocaleDateString()}</p>
        <p><span class="font-medium">Status:</span> ${s(t.status)}</p>
        <p><span class="font-medium">Type:</span> Purchase</p>
      </div>
    </div>
    <div class="payment-info">
      <div class="section-title">Payment:</div>
      <div class="section-content">
        <p><span class="font-medium">Status:</span> ${s(((f=t.payment)==null?void 0:f.status)||"pending")}</p>
        <p><span class="font-medium">Method:</span> ${s(((q=t.payment)==null?void 0:q.method)||"cash")}</p>
        <p><span class="font-medium">Amount:</span> ${Math.round(((U=t.pricing)==null?void 0:U.total)||0)}</p>
      </div>
    </div>
  </div>
  
  <div>
    <div class="section-title" style="margin-bottom: 10px;">Items:</div>
    <table class="items-table">
      <thead>
        <tr>
          <th class="border border-gray-300 px-4 py-2 text-left">Item</th>
          <th class="border border-gray-300 px-4 py-2 text-left">Description</th>
          <th class="border border-gray-300 px-4 py-2 text-right">Qty</th>
          <th class="border border-gray-300 px-4 py-2 text-right">Cost</th>
          <th class="border border-gray-300 px-4 py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${i}
      </tbody>
    </table>
  </div>
  
  <div class="totals" style="display: flex; justify-content: flex-end;">
    <table>
      <tbody>
        <tr>
          <td class="px-4 py-2">Subtotal:</td>
          <td class="px-4 py-2 text-right">${Math.round(((G=t.pricing)==null?void 0:G.subtotal)||0)}</td>
        </tr>
        ${((Q=t.pricing)==null?void 0:Q.taxAmount)>0?`
        <tr>
          <td class="px-4 py-2">Tax:</td>
          <td class="px-4 py-2 text-right">${Math.round(t.pricing.taxAmount)}</td>
        </tr>
        `:""}
        ${((B=t.pricing)==null?void 0:B.discountAmount)>0?`
        <tr>
          <td class="px-4 py-2">Discount:</td>
          <td class="px-4 py-2 text-right">${Math.round(t.pricing.discountAmount)}</td>
        </tr>
        `:""}
        <tr class="total-row">
          <td class="px-4 py-2 font-bold">Total:</td>
          <td class="px-4 py-2 text-right font-bold">${Math.round(((J=t.pricing)==null?void 0:J.total)||0)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
  </div>
  
  <script>window.onload=()=>{window.print();}<\/script>
</body>
</html>`;n.document.open(),n.document.write(c),n.document.close()},le=t=>{var s,i,c;const n=t.status==="confirmed"?`Are you sure you want to delete invoice ${t.invoiceNumber}?

This will:
• Remove ${((s=t.items)==null?void 0:s.length)||0} products from inventory
• Reduce supplier balance by ${Math.round((((i=t.pricing)==null?void 0:i.total)||0)-(((c=t.payment)==null?void 0:c.amount)||0))}`:`Are you sure you want to delete invoice ${t.invoiceNumber}?`;window.confirm(n)&&ie(t._id).unwrap().then(()=>{Y("Purchase invoice deleted successfully"),D()}).catch(d=>{Ie(d,"Purchase Invoice Deletion")})},oe=t=>{const n=Se("/purchase");if(n){const s=`tab_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,i={invoiceId:t._id,invoiceNumber:t.invoiceNumber,supplier:t.supplierInfo,items:t.items||[],notes:t.notes||"",invoiceType:t.invoiceType||"purchase",isEditMode:!0};se({title:`Edit Purchase - ${t.invoiceNumber}`,path:"/purchase",component:n.component,icon:n.icon,allowMultiple:!0,props:{tabId:s,editData:i}}),Y(`Opening ${t.invoiceNumber} for editing...`)}else we("Purchase page not found")},ce=t=>{ee(t),S(!0)},C=X.useMemo(()=>{var t,n,s;return r?(t=r==null?void 0:r.data)!=null&&t.invoices?r.data.invoices:r!=null&&r.invoices?r.invoices:(s=(n=r==null?void 0:r.data)==null?void 0:n.data)!=null&&s.invoices?r.data.data.invoices:Array.isArray(r)?r:Array.isArray(r==null?void 0:r.data)?r.data:[]:[]},[r]);return re?e.jsx(fe,{}):ne?e.jsxs("div",{className:"text-center py-12",children:[e.jsx("p",{className:"text-red-600",children:"Failed to load purchase invoices"}),e.jsx("button",{onClick:D,className:"btn btn-primary mt-4",children:"Try Again"})]}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Purchase Invoices"}),e.jsx("p",{className:"text-gray-600",children:"Track and manage supplier invoices and receipts"})]}),e.jsxs("button",{className:"btn btn-primary btn-md",children:[e.jsx(De,{className:"h-4 w-4 mr-2"}),"New Invoice"]})]}),e.jsxs("div",{className:"card",children:[e.jsx("div",{className:"card-header",children:e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(Me,{className:"h-5 w-5 text-gray-400"}),e.jsx("h3",{className:"text-lg font-medium text-gray-900",children:"Filters"})]})}),e.jsx("div",{className:"card-content",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Search"}),e.jsxs("div",{className:"relative",children:[e.jsx(je,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Invoice number, supplier, amount...",value:p,onChange:t=>j(t.target.value),className:"input pl-10 w-full h-[42px]"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"From Date"}),e.jsx("input",{type:"date",value:m,onChange:t=>W(t.target.value),className:"input h-[42px]"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"To Date"}),e.jsx("input",{type:"date",value:h,onChange:t=>Z(t.target.value),className:"input h-[42px]"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Status"}),e.jsxs("select",{value:l,onChange:t=>v(t.target.value),className:"input h-[42px]",children:[e.jsx("option",{value:"",children:"All Status"}),e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"confirmed",children:"Confirmed"}),e.jsx("option",{value:"received",children:"Received"}),e.jsx("option",{value:"paid",children:"Paid"}),e.jsx("option",{value:"cancelled",children:"Cancelled"}),e.jsx("option",{value:"closed",children:"Closed"})]})]})]})})]}),C.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(Ne,{className:"mx-auto h-12 w-12 text-gray-400"}),e.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No purchase invoices found"}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:p||l||m||h?"Try adjusting your filters.":"No purchase invoices have been created yet."})]}):e.jsxs("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",children:[e.jsx("div",{className:"bg-gray-50 px-6 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider",children:[e.jsx("div",{className:"col-span-2",children:"Invoice Number"}),e.jsx("div",{className:"col-span-2",children:"Supplier"}),e.jsx("div",{className:"col-span-1",children:"Date"}),e.jsx("div",{className:"col-span-1",children:"Items"}),e.jsx("div",{className:"col-span-1",children:"Total"}),e.jsx("div",{className:"col-span-1",children:"Status"}),e.jsx("div",{className:"col-span-1",children:"Payment"}),e.jsx("div",{className:"col-span-1",children:"Notes"}),e.jsx("div",{className:"col-span-2",children:"Actions"})]})}),e.jsx("div",{className:"divide-y divide-gray-200",children:C.map(t=>{var n,s,i,c,d,u,g,b,y,f;return e.jsx("div",{className:"px-6 py-4 hover:bg-gray-50 transition-colors",children:e.jsxs("div",{className:"grid grid-cols-12 gap-4 items-center",children:[e.jsx("div",{className:"col-span-2",children:e.jsx("div",{className:"font-medium text-gray-900 truncate",children:t.invoiceNumber})}),e.jsx("div",{className:"col-span-2",children:e.jsx("div",{className:"text-sm text-gray-900 truncate",children:((n=t.supplierInfo)==null?void 0:n.companyName)||((s=t.supplierInfo)==null?void 0:s.name)||"Unknown Supplier"})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"text-sm text-gray-600",children:new Date(t.createdAt).toLocaleDateString()})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"text-sm text-gray-600",children:((i=t.items)==null?void 0:i.length)||0})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"font-semibold text-gray-900",children:Math.round(((c=t.pricing)==null?void 0:c.total)||0)})}),e.jsx("div",{className:"col-span-1",children:e.jsx(Te,{status:t.status})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${((d=t.payment)==null?void 0:d.status)==="paid"?"bg-green-100 text-green-800":((u=t.payment)==null?void 0:u.status)==="partial"?"bg-yellow-100 text-yellow-800":((g=t.payment)==null?void 0:g.status)==="overdue"?"bg-red-100 text-red-800":"bg-gray-100 text-gray-800"}`,children:((b=t.payment)==null?void 0:b.status)||"pending"})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"text-xs text-gray-600 block truncate",title:((y=t.notes)==null?void 0:y.trim())||"No notes",children:((f=t.notes)==null?void 0:f.trim())||"—"})}),e.jsx("div",{className:"col-span-2",children:e.jsxs("div",{className:"flex items-center space-x-1",children:[e.jsx("button",{onClick:()=>ce(t),className:"text-gray-600 hover:text-gray-800 p-1",title:"View Invoice",children:e.jsx(Ce,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>M(t),className:"text-green-600 hover:text-green-800 p-1",title:"Print Invoice",children:e.jsx(H,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>oe(t),className:"text-blue-600 hover:text-blue-800 p-1",title:"Edit Invoice",children:e.jsx(Pe,{className:"h-4 w-4"})}),!["paid","closed"].includes(t.status)&&e.jsx("button",{onClick:()=>le(t),className:"text-red-600 hover:text-red-800 p-1",title:"Delete Invoice",children:e.jsx($e,{className:"h-4 w-4"})})]})})]})},t._id)})})]}),te&&a&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:e.jsx("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex justify-between items-center mb-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900",children:"Purchase Invoice Details"}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsxs("button",{onClick:()=>M(a),className:"bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2",children:[e.jsx(H,{className:"h-4 w-4"}),e.jsx("span",{children:"Print"})]}),e.jsx("button",{onClick:()=>S(!1),className:"bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700",children:"Close"})]})]}),e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:"Your Company Name"}),e.jsx("p",{className:"text-lg text-gray-600",children:"Purchase Invoice"})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-8 mb-8",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Supplier Details:"}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium",children:((P=a.supplierInfo)==null?void 0:P.companyName)||(($=a.supplierInfo)==null?void 0:$.name)||"Unknown Supplier"}),e.jsx("p",{className:"text-gray-600",children:((T=a.supplierInfo)==null?void 0:T.email)||""}),e.jsx("p",{className:"text-gray-600",children:((A=a.supplierInfo)==null?void 0:A.phone)||""}),e.jsx("p",{className:"text-gray-600",children:((k=a.supplierInfo)==null?void 0:k.address)||""})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Invoice Details:"}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Invoice #:"})," ",a.invoiceNumber]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Date:"})," ",new Date(a.createdAt).toLocaleDateString()]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Status:"})," ",a.status]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Type:"})," Purchase"]})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Payment:"}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Status:"})," ",((E=a.payment)==null?void 0:E.status)||"pending"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Method:"})," ",((F=a.payment)==null?void 0:F.method)||"cash"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Amount:"})," ",Math.round(((L=a.pricing)==null?void 0:L.total)||0)]})]})]})]}),e.jsxs("div",{className:"mb-8",children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Items:"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full border-collapse border border-gray-300",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50",children:[e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-left",children:"Item"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-left",children:"Description"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-right",children:"Qty"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-right",children:"Cost"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-right",children:"Total"})]})}),e.jsx("tbody",{children:((R=a.items)==null?void 0:R.map((t,n)=>{var s,i;return e.jsxs("tr",{children:[e.jsx("td",{className:"border border-gray-300 px-4 py-2",children:((s=t.product)==null?void 0:s.name)||"Unknown Product"}),e.jsx("td",{className:"border border-gray-300 px-4 py-2",children:((i=t.product)==null?void 0:i.description)||""}),e.jsx("td",{className:"border border-gray-300 px-4 py-2 text-right",children:t.quantity}),e.jsx("td",{className:"border border-gray-300 px-4 py-2 text-right",children:Math.round(t.unitCost||0)}),e.jsx("td",{className:"border border-gray-300 px-4 py-2 text-right",children:Math.round(t.totalCost||0)})]},n)}))||e.jsx("tr",{children:e.jsx("td",{colSpan:"5",className:"border border-gray-300 px-4 py-2 text-center text-gray-500",children:"No items found"})})})]})})]}),e.jsx("div",{className:"flex justify-end",children:e.jsx("div",{className:"w-80",children:e.jsx("table",{className:"w-full",children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-2",children:"Subtotal:"}),e.jsx("td",{className:"px-4 py-2 text-right",children:Math.round(((z=a.pricing)==null?void 0:z.subtotal)||0)})]}),((O=a.pricing)==null?void 0:O.taxAmount)>0&&e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-2",children:"Tax:"}),e.jsx("td",{className:"px-4 py-2 text-right",children:Math.round(a.pricing.taxAmount)})]}),((V=a.pricing)==null?void 0:V.discountAmount)>0&&e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-2",children:"Discount:"}),e.jsx("td",{className:"px-4 py-2 text-right",children:Math.round(a.pricing.discountAmount)})]}),e.jsxs("tr",{className:"border-t-2 border-gray-900",children:[e.jsx("td",{className:"px-4 py-2 font-bold",children:"Total:"}),e.jsx("td",{className:"px-4 py-2 text-right font-bold",children:Math.round(((_=a.pricing)==null?void 0:_.total)||0)})]})]})})})}),e.jsxs("div",{className:"mt-8 text-center text-sm text-gray-500",children:["Generated on ",new Date().toLocaleDateString()," at ",new Date().toLocaleTimeString()]})]})})})]})};export{He as PurchaseInvoices};
