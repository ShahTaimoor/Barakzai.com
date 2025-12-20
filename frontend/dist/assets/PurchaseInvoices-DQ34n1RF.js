import{r as y,u as ne,a4 as le,a5 as ie,a6 as oe,a7 as ce,a8 as de,a9 as pe,aa as xe,ab as me,o as e,N as he,S as ue,a3 as ge,C as be,z as X,x as ye,w as fe}from"./index-jd7Ax_Ed.js";import{g as je}from"./ComponentRegistry-COpHSNtL.js";import{P as Ne}from"./plus-C2o0386P.js";import{E as ve}from"./eye-DMmE8Niy.js";import{P as Y}from"./printer-BkLl9NNZ.js";import{P as we}from"./pen-square-CzKMgeH3.js";import{T as Ie}from"./trash-2-DCbqoVbR.js";import{X as B}from"./x-circle-CN1zMonK.js";import{C as v}from"./check-circle-8oGxTki5.js";const Se=({status:d})=>{const g={draft:{color:"bg-gray-100 text-gray-800",icon:be,label:"Draft"},confirmed:{color:"bg-blue-100 text-blue-800",icon:v,label:"Confirmed"},received:{color:"bg-green-100 text-green-800",icon:v,label:"Received"},paid:{color:"bg-green-100 text-green-800",icon:v,label:"Paid"},cancelled:{color:"bg-red-100 text-red-800",icon:B,label:"Cancelled"},closed:{color:"bg-gray-100 text-gray-800",icon:B,label:"Closed"}},i=g[d]||g.draft,f=i.icon;return e.jsxs("span",{className:`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${i.color}`,children:[e.jsx(f,{className:"h-3 w-3 mr-1"}),i.label]})},qe=()=>{var C,D,P,$,T,k,A,E,L,z,F,R,V,_;const[d,g]=y.useState(""),[i,f]=y.useState(""),[a,H]=y.useState(null),[K,w]=y.useState(!1),{openTab:W}=ne(),{data:j,isLoading:Z,error:ee,refetch:I}=le({search:d,status:i||void 0},{refetchOnMountOrArgChange:!0}),[Me,{isLoading:Ce}]=ie(),[te,{isLoading:De}]=oe(),[Pe]=ce(),[$e]=de(),[Te]=pe(),[ke]=xe(),[Ae]=me(),S=t=>{var c,p,x,m,h,u,O,U,q,G,Q,J;if(!t)return;const r=window.open("","_blank");if(!r)return;const s=l=>l?String(l).replace(/[&<>"']/g,b=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[b]):"",n=(t.items||[]).map(l=>{var b,N;return`
      <tr>
        <td class="border border-gray-300 px-4 py-2">${s(((b=l.product)==null?void 0:b.name)||"Unknown Product")}</td>
        <td class="border border-gray-300 px-4 py-2">${s(((N=l.product)==null?void 0:N.description)||"")}</td>
        <td class="border border-gray-300 px-4 py-2 text-right">${l.quantity||0}</td>
        <td class="border border-gray-300 px-4 py-2 text-right">${Math.round(l.unitCost||0)}</td>
        <td class="border border-gray-300 px-4 py-2 text-right">${Math.round(l.totalCost||0)}</td>
      </tr>
    `}).join("")||`
      <tr>
        <td colspan="5" class="border border-gray-300 px-4 py-2 text-center text-gray-500">No items found</td>
      </tr>
    `,o=`<!doctype html>
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
        <p style="font-weight: 500;">${s(((c=t.supplierInfo)==null?void 0:c.companyName)||((p=t.supplierInfo)==null?void 0:p.name)||"Unknown Supplier")}</p>
        <p>${s(((x=t.supplierInfo)==null?void 0:x.email)||"")}</p>
        <p>${s(((m=t.supplierInfo)==null?void 0:m.phone)||"")}</p>
        <p>${s(((h=t.supplierInfo)==null?void 0:h.address)||"")}</p>
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
        <p><span class="font-medium">Status:</span> ${s(((u=t.payment)==null?void 0:u.status)||"pending")}</p>
        <p><span class="font-medium">Method:</span> ${s(((O=t.payment)==null?void 0:O.method)||"cash")}</p>
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
        ${n}
      </tbody>
    </table>
  </div>
  
  <div class="totals" style="display: flex; justify-content: flex-end;">
    <table>
      <tbody>
        <tr>
          <td class="px-4 py-2">Subtotal:</td>
          <td class="px-4 py-2 text-right">${Math.round(((q=t.pricing)==null?void 0:q.subtotal)||0)}</td>
        </tr>
        ${((G=t.pricing)==null?void 0:G.taxAmount)>0?`
        <tr>
          <td class="px-4 py-2">Tax:</td>
          <td class="px-4 py-2 text-right">${Math.round(t.pricing.taxAmount)}</td>
        </tr>
        `:""}
        ${((Q=t.pricing)==null?void 0:Q.discountAmount)>0?`
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
</html>`;r.document.open(),r.document.write(o),r.document.close()},se=t=>{var s,n,o;const r=t.status==="confirmed"?`Are you sure you want to delete invoice ${t.invoiceNumber}?

This will:
• Remove ${((s=t.items)==null?void 0:s.length)||0} products from inventory
• Reduce supplier balance by ${Math.round((((n=t.pricing)==null?void 0:n.total)||0)-(((o=t.payment)==null?void 0:o.amount)||0))}`:`Are you sure you want to delete invoice ${t.invoiceNumber}?`;window.confirm(r)&&te(t._id).unwrap().then(()=>{X("Purchase invoice deleted successfully"),I()}).catch(c=>{fe(c,"Purchase Invoice Deletion")})},ae=t=>{const r=je("/purchase");if(r){const s=`tab_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,n={invoiceId:t._id,invoiceNumber:t.invoiceNumber,supplier:t.supplierInfo,items:t.items||[],notes:t.notes||"",invoiceType:t.invoiceType||"purchase",isEditMode:!0};W({title:`Edit Purchase - ${t.invoiceNumber}`,path:"/purchase",component:r.component,icon:r.icon,allowMultiple:!0,props:{tabId:s,editData:n}}),X(`Opening ${t.invoiceNumber} for editing...`)}else ye("Purchase page not found")},re=t=>{H(t),w(!0)};if(Z)return e.jsx(he,{});if(ee)return e.jsxs("div",{className:"text-center py-12",children:[e.jsx("p",{className:"text-red-600",children:"Failed to load purchase invoices"}),e.jsx("button",{onClick:I,className:"btn btn-primary mt-4",children:"Try Again"})]});const M=((C=j==null?void 0:j.data)==null?void 0:C.invoices)||[];return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Purchase Invoices"}),e.jsx("p",{className:"text-gray-600",children:"Track and manage supplier invoices and receipts"})]}),e.jsxs("button",{className:"btn btn-primary btn-md",children:[e.jsx(Ne,{className:"h-4 w-4 mr-2"}),"New Invoice"]})]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("div",{className:"flex-1 relative min-w-0",children:[e.jsx(ue,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx("input",{type:"text",placeholder:"Search by invoice number, supplier name, or amount...",value:d,onChange:t=>g(t.target.value),className:"input pl-10 w-full"})]}),e.jsx("div",{className:"flex-shrink-0",children:e.jsxs("select",{value:i,onChange:t=>f(t.target.value),className:"input min-w-[120px]",children:[e.jsx("option",{value:"",children:"All Status"}),e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"confirmed",children:"Confirmed"}),e.jsx("option",{value:"received",children:"Received"}),e.jsx("option",{value:"paid",children:"Paid"}),e.jsx("option",{value:"cancelled",children:"Cancelled"}),e.jsx("option",{value:"closed",children:"Closed"})]})})]}),M.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(ge,{className:"mx-auto h-12 w-12 text-gray-400"}),e.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No purchase invoices found"}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:d||i?"Try adjusting your search terms.":"No purchase invoices have been created yet."})]}):e.jsxs("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",children:[e.jsx("div",{className:"bg-gray-50 px-6 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider",children:[e.jsx("div",{className:"col-span-2",children:"Invoice Number"}),e.jsx("div",{className:"col-span-2",children:"Supplier"}),e.jsx("div",{className:"col-span-1",children:"Date"}),e.jsx("div",{className:"col-span-1",children:"Items"}),e.jsx("div",{className:"col-span-1",children:"Total"}),e.jsx("div",{className:"col-span-1",children:"Status"}),e.jsx("div",{className:"col-span-1",children:"Payment"}),e.jsx("div",{className:"col-span-1",children:"Notes"}),e.jsx("div",{className:"col-span-2",children:"Actions"})]})}),e.jsx("div",{className:"divide-y divide-gray-200",children:M.map(t=>{var r,s,n,o,c,p,x,m,h,u;return e.jsx("div",{className:"px-6 py-4 hover:bg-gray-50 transition-colors",children:e.jsxs("div",{className:"grid grid-cols-12 gap-4 items-center",children:[e.jsx("div",{className:"col-span-2",children:e.jsx("div",{className:"font-medium text-gray-900 truncate",children:t.invoiceNumber})}),e.jsx("div",{className:"col-span-2",children:e.jsx("div",{className:"text-sm text-gray-900 truncate",children:((r=t.supplierInfo)==null?void 0:r.companyName)||((s=t.supplierInfo)==null?void 0:s.name)||"Unknown Supplier"})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"text-sm text-gray-600",children:new Date(t.createdAt).toLocaleDateString()})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"text-sm text-gray-600",children:((n=t.items)==null?void 0:n.length)||0})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"font-semibold text-gray-900",children:Math.round(((o=t.pricing)==null?void 0:o.total)||0)})}),e.jsx("div",{className:"col-span-1",children:e.jsx(Se,{status:t.status})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${((c=t.payment)==null?void 0:c.status)==="paid"?"bg-green-100 text-green-800":((p=t.payment)==null?void 0:p.status)==="partial"?"bg-yellow-100 text-yellow-800":((x=t.payment)==null?void 0:x.status)==="overdue"?"bg-red-100 text-red-800":"bg-gray-100 text-gray-800"}`,children:((m=t.payment)==null?void 0:m.status)||"pending"})}),e.jsx("div",{className:"col-span-1",children:e.jsx("span",{className:"text-xs text-gray-600 block truncate",title:((h=t.notes)==null?void 0:h.trim())||"No notes",children:((u=t.notes)==null?void 0:u.trim())||"—"})}),e.jsx("div",{className:"col-span-2",children:e.jsxs("div",{className:"flex items-center space-x-1",children:[e.jsx("button",{onClick:()=>re(t),className:"text-gray-600 hover:text-gray-800 p-1",title:"View Invoice",children:e.jsx(ve,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>S(t),className:"text-green-600 hover:text-green-800 p-1",title:"Print Invoice",children:e.jsx(Y,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>ae(t),className:"text-blue-600 hover:text-blue-800 p-1",title:"Edit Invoice",children:e.jsx(we,{className:"h-4 w-4"})}),!["paid","closed"].includes(t.status)&&e.jsx("button",{onClick:()=>se(t),className:"text-red-600 hover:text-red-800 p-1",title:"Delete Invoice",children:e.jsx(Ie,{className:"h-4 w-4"})})]})})]})},t._id)})})]}),K&&a&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:e.jsx("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex justify-between items-center mb-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900",children:"Purchase Invoice Details"}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsxs("button",{onClick:()=>S(a),className:"bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2",children:[e.jsx(Y,{className:"h-4 w-4"}),e.jsx("span",{children:"Print"})]}),e.jsx("button",{onClick:()=>w(!1),className:"bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700",children:"Close"})]})]}),e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:"Your Company Name"}),e.jsx("p",{className:"text-lg text-gray-600",children:"Purchase Invoice"})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-8 mb-8",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Supplier Details:"}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium",children:((D=a.supplierInfo)==null?void 0:D.companyName)||((P=a.supplierInfo)==null?void 0:P.name)||"Unknown Supplier"}),e.jsx("p",{className:"text-gray-600",children:(($=a.supplierInfo)==null?void 0:$.email)||""}),e.jsx("p",{className:"text-gray-600",children:((T=a.supplierInfo)==null?void 0:T.phone)||""}),e.jsx("p",{className:"text-gray-600",children:((k=a.supplierInfo)==null?void 0:k.address)||""})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Invoice Details:"}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Invoice #:"})," ",a.invoiceNumber]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Date:"})," ",new Date(a.createdAt).toLocaleDateString()]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Status:"})," ",a.status]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Type:"})," Purchase"]})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Payment:"}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Status:"})," ",((A=a.payment)==null?void 0:A.status)||"pending"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Method:"})," ",((E=a.payment)==null?void 0:E.method)||"cash"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Amount:"})," ",Math.round(((L=a.pricing)==null?void 0:L.total)||0)]})]})]})]}),e.jsxs("div",{className:"mb-8",children:[e.jsx("h3",{className:"font-semibold text-gray-900 border-b border-gray-300 pb-2 mb-4",children:"Items:"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full border-collapse border border-gray-300",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-50",children:[e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-left",children:"Item"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-left",children:"Description"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-right",children:"Qty"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-right",children:"Cost"}),e.jsx("th",{className:"border border-gray-300 px-4 py-2 text-right",children:"Total"})]})}),e.jsx("tbody",{children:((z=a.items)==null?void 0:z.map((t,r)=>{var s,n;return e.jsxs("tr",{children:[e.jsx("td",{className:"border border-gray-300 px-4 py-2",children:((s=t.product)==null?void 0:s.name)||"Unknown Product"}),e.jsx("td",{className:"border border-gray-300 px-4 py-2",children:((n=t.product)==null?void 0:n.description)||""}),e.jsx("td",{className:"border border-gray-300 px-4 py-2 text-right",children:t.quantity}),e.jsx("td",{className:"border border-gray-300 px-4 py-2 text-right",children:Math.round(t.unitCost||0)}),e.jsx("td",{className:"border border-gray-300 px-4 py-2 text-right",children:Math.round(t.totalCost||0)})]},r)}))||e.jsx("tr",{children:e.jsx("td",{colSpan:"5",className:"border border-gray-300 px-4 py-2 text-center text-gray-500",children:"No items found"})})})]})})]}),e.jsx("div",{className:"flex justify-end",children:e.jsx("div",{className:"w-80",children:e.jsx("table",{className:"w-full",children:e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-2",children:"Subtotal:"}),e.jsx("td",{className:"px-4 py-2 text-right",children:Math.round(((F=a.pricing)==null?void 0:F.subtotal)||0)})]}),((R=a.pricing)==null?void 0:R.taxAmount)>0&&e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-2",children:"Tax:"}),e.jsx("td",{className:"px-4 py-2 text-right",children:Math.round(a.pricing.taxAmount)})]}),((V=a.pricing)==null?void 0:V.discountAmount)>0&&e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-2",children:"Discount:"}),e.jsx("td",{className:"px-4 py-2 text-right",children:Math.round(a.pricing.discountAmount)})]}),e.jsxs("tr",{className:"border-t-2 border-gray-900",children:[e.jsx("td",{className:"px-4 py-2 font-bold",children:"Total:"}),e.jsx("td",{className:"px-4 py-2 text-right font-bold",children:Math.round(((_=a.pricing)==null?void 0:_.total)||0)})]})]})})})}),e.jsxs("div",{className:"mt-8 text-center text-sm text-gray-500",children:["Generated on ",new Date().toLocaleDateString()," at ",new Date().toLocaleTimeString()]})]})})})]})};export{qe as PurchaseInvoices};
