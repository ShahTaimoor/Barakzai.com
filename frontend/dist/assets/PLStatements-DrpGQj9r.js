import{D as is,G as os,r as z,p as e,ak as ss,T as Xe,aO as Ye,C as ns,H as ds,y as qe,R as ls,J as cs,x as ms,O as xs,a2 as gs,K as us,B as je,z as Re}from"./index-Cw3xRKpc.js";import{A as ps}from"./AsyncErrorBoundary-O-YjuvhS.js";import{E as ts}from"./eye-off-DT0V_He4.js";import{E as We}from"./eye-DISpb38e.js";import{D as He}from"./download-B8XL5QGf.js";import{C as as}from"./calculator-9IOFXN46.js";import{P as hs}from"./percent-DzeNs1WE.js";import{A as Je}from"./alert-circle-HQsWpy-L.js";import{P as Be}from"./pen-square-XPG_rn4Q.js";import{C as ze}from"./check-circle-C7396OEq.js";import{F as bs}from"./filter-bwJnrGXq.js";import{P as rs}from"./plus-DxsvPhf3.js";import{X as Ve}from"./x-circle-MQqDWFsw.js";import{T as ys}from"./trash-2-D2rrIU_x.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fs=is("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]),js=os.injectEndpoints({endpoints:t=>({generateStatement:t.mutation({query:o=>({url:"pl-statements/generate",method:"post",data:o}),invalidatesTags:[{type:"Reports",id:"PL_STATEMENTS"}]}),getStatements:t.query({query:o=>({url:"pl-statements",method:"get",params:o}),providesTags:o=>{var g,n;return(g=o==null?void 0:o.data)!=null&&g.statements||o!=null&&o.statements?[...(((n=o.data)==null?void 0:n.statements)||o.statements).map(({_id:c,id:p})=>({type:"Reports",id:c||p})),{type:"Reports",id:"PL_STATEMENTS"}]:[{type:"Reports",id:"PL_STATEMENTS"}]}}),getStatement:t.query({query:o=>({url:`pl-statements/${o}`,method:"get"}),providesTags:(o,g,n)=>[{type:"Reports",id:n}]}),updateStatement:t.mutation({query:({id:o,...g})=>({url:`pl-statements/${o}`,method:"put",data:g}),invalidatesTags:(o,g,{id:n})=>[{type:"Reports",id:n},{type:"Reports",id:"PL_STATEMENTS"}]}),updateStatementStatus:t.mutation({query:({id:o,...g})=>({url:`pl-statements/${o}/status`,method:"put",data:g}),invalidatesTags:(o,g,{id:n})=>[{type:"Reports",id:n},{type:"Reports",id:"PL_STATEMENTS"}]}),deleteStatement:t.mutation({query:o=>({url:`pl-statements/${o}`,method:"delete"}),invalidatesTags:(o,g,n)=>[{type:"Reports",id:n},{type:"Reports",id:"PL_STATEMENTS"}]}),getSummary:t.query({query:o=>({url:"pl-statements/summary",method:"get",params:o}),providesTags:[{type:"Reports",id:"PL_STATEMENTS_SUMMARY"}]}),getTrends:t.query({query:o=>({url:"pl-statements/trends",method:"get",params:o}),providesTags:[{type:"Reports",id:"PL_STATEMENTS_TRENDS"}]}),getComparison:t.query({query:({id:o,type:g="previous"})=>({url:`pl-statements/${o}/comparison`,method:"get",params:{type:g}}),providesTags:(o,g,{id:n})=>[{type:"Reports",id:`COMPARISON_${n}`}]}),exportStatement:t.mutation({query:({id:o,...g})=>({url:`pl-statements/${o}/export`,method:"post",data:g,responseType:"blob"})}),getLatestStatement:t.query({query:o=>({url:"pl-statements/latest",method:"get",params:o}),providesTags:[{type:"Reports",id:"PL_STATEMENTS_LATEST"}]})}),overrideExisting:!1}),{useGenerateStatementMutation:Ns,useGetStatementsQuery:vs,useGetStatementQuery:Ss,useUpdateStatementMutation:ws,useUpdateStatementStatusMutation:Es,useDeleteStatementMutation:Ds,useExportStatementMutation:$s}=js,Is=({statement:t,onExport:o,onShare:g})=>{var V,q,pe,he,ve,be,Se,C,ke,Le,Ae,De,Ge,Me,Fe,_e,Ue,B,$e,$,Ie,Pe,s,h,b,a,N,I,R,k,L,A,y,P,G,v,f,S,w,M,X,O,r,l,we,W,Ee,ye,F,fe,H,J,Q,K,Z,ee,se,te,ae,re,ne,le,ie,oe,de,ce,me,xe,ge;const[n,c]=z.useState(!0),[p,x]=z.useState(!1),i=m=>`$${(m==null?void 0:m.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}))||"0.00"}`,d=m=>`${(m==null?void 0:m.toFixed(1))||"0.0"}%`,D=m=>new Date(m).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),U=m=>{switch(m){case"published":return e.jsx(ze,{className:"h-5 w-5 text-green-500"});case"approved":return e.jsx(ze,{className:"h-5 w-5 text-blue-500"});case"review":return e.jsx(ns,{className:"h-5 w-5 text-yellow-500"});case"draft":return e.jsx(Be,{className:"h-5 w-5 text-gray-500"});default:return e.jsx(Je,{className:"h-5 w-5 text-red-500"})}},Ne=m=>{switch(m){case"published":return"text-green-600 bg-green-50 border-green-200";case"approved":return"text-blue-600 bg-blue-50 border-blue-200";case"review":return"text-yellow-600 bg-yellow-50 border-yellow-200";case"draft":return"text-gray-600 bg-gray-50 border-gray-200";default:return"text-red-600 bg-red-50 border-red-200"}},j=m=>m>=0,ue=m=>j(m)?e.jsx(Xe,{className:"h-4 w-4 text-green-500"}):e.jsx(Ye,{className:"h-4 w-4 text-red-500"}),T=m=>j(m)?"text-green-600":"text-red-600";return e.jsxs("div",{className:"max-w-4xl mx-auto bg-white rounded-lg shadow-lg",children:[e.jsx("div",{className:"border-b border-gray-200 p-6",children:e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Profit & Loss Statement"}),e.jsxs("p",{className:"text-gray-600 mt-1",children:[D((V=t.period)==null?void 0:V.startDate)," - ",D((q=t.period)==null?void 0:q.endDate)]}),((pe=t.company)==null?void 0:pe.name)&&e.jsx("p",{className:"text-sm text-gray-500 mt-1",children:t.company.name})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${Ne(t.status)}`,children:[U(t.status),e.jsx("span",{className:"ml-2 capitalize",children:t.status})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("button",{onClick:()=>c(!n),className:"p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",title:n?"Hide Details":"Show Details",children:n?e.jsx(ts,{className:"h-5 w-5"}):e.jsx(We,{className:"h-5 w-5"})}),e.jsx("button",{onClick:()=>o(t),className:"p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",title:"Export Statement",children:e.jsx(He,{className:"h-5 w-5"})}),e.jsx("button",{onClick:()=>g(t),className:"p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors",title:"Share Statement",children:e.jsx(fs,{className:"h-5 w-5"})})]})]})]})}),e.jsx("div",{className:"p-6 bg-gray-50",children:e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-6",children:[e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[e.jsx(ss,{className:"h-5 w-5 text-blue-500 mr-1"}),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Total Revenue"})]}),e.jsx("p",{className:"text-2xl font-bold text-gray-900",children:i((ve=(he=t.revenue)==null?void 0:he.totalRevenue)==null?void 0:ve.amount)})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[e.jsx(as,{className:"h-5 w-5 text-green-500 mr-1"}),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Gross Profit"})]}),e.jsx("p",{className:`text-2xl font-bold ${T((be=t.grossProfit)==null?void 0:be.amount)}`,children:i((Se=t.grossProfit)==null?void 0:Se.amount)}),e.jsxs("p",{className:"text-sm text-gray-500",children:[d((C=t.grossProfit)==null?void 0:C.margin)," margin"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[e.jsx(Xe,{className:"h-5 w-5 text-purple-500 mr-1"}),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Operating Income"})]}),e.jsx("p",{className:`text-2xl font-bold ${T((ke=t.operatingIncome)==null?void 0:ke.amount)}`,children:i((Le=t.operatingIncome)==null?void 0:Le.amount)}),e.jsxs("p",{className:"text-sm text-gray-500",children:[d((Ae=t.operatingIncome)==null?void 0:Ae.margin)," margin"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[ue((De=t.netIncome)==null?void 0:De.amount),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Net Income"})]}),e.jsx("p",{className:`text-2xl font-bold ${T((Ge=t.netIncome)==null?void 0:Ge.amount)}`,children:i((Me=t.netIncome)==null?void 0:Me.amount)}),e.jsxs("p",{className:"text-sm text-gray-500",children:[d((Fe=t.netIncome)==null?void 0:Fe.margin)," margin"]})]})]})}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(ss,{className:"h-5 w-5 text-green-500 mr-2"}),"Revenue"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsx("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Gross Sales"}),e.jsx("span",{className:"font-semibold text-gray-900",children:i((Ue=(_e=t.revenue)==null?void 0:_e.grossSales)==null?void 0:Ue.amount)})]})}),n&&(($=($e=(B=t.revenue)==null?void 0:B.grossSales)==null?void 0:$e.details)==null?void 0:$.length)>0&&e.jsx("div",{className:"px-4 py-2 bg-gray-25",children:t.revenue.grossSales.details.map((m,u)=>e.jsxs("div",{className:"flex justify-between items-center py-1 text-sm",children:[e.jsx("span",{className:"text-gray-600 ml-4",children:m.category}),e.jsx("span",{className:"text-gray-900",children:i(m.amount)})]},u))}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Sales Returns"}),e.jsxs("span",{className:"font-semibold text-red-600",children:["-",i((Pe=(Ie=t.revenue)==null?void 0:Ie.salesReturns)==null?void 0:Pe.amount)]})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Sales Discounts"}),e.jsxs("span",{className:"font-semibold text-red-600",children:["-",i((h=(s=t.revenue)==null?void 0:s.salesDiscounts)==null?void 0:h.amount)]})]})}),e.jsx("div",{className:"px-4 py-3 bg-blue-50 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-semibold text-gray-900",children:"Net Sales"}),e.jsx("span",{className:"font-bold text-blue-600",children:i((a=(b=t.revenue)==null?void 0:b.netSales)==null?void 0:a.amount)})]})}),e.jsx("div",{className:"px-4 py-3",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Other Revenue"}),e.jsx("span",{className:"font-semibold text-gray-900",children:i((I=(N=t.revenue)==null?void 0:N.otherRevenue)==null?void 0:I.amount)})]})}),e.jsx("div",{className:"px-4 py-4 bg-green-50 border-t-2 border-green-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Total Revenue"}),e.jsx("span",{className:"text-xl font-bold text-green-600",children:i((k=(R=t.revenue)==null?void 0:R.totalRevenue)==null?void 0:k.amount)})]})})]})]}),e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(as,{className:"h-5 w-5 text-red-500 mr-2"}),"Cost of Goods Sold"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsx("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Beginning Inventory"}),e.jsx("span",{className:"font-semibold text-gray-900",children:i((L=t.costOfGoodsSold)==null?void 0:L.beginningInventory)})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Purchases"}),e.jsx("span",{className:"font-semibold text-gray-900",children:i((y=(A=t.costOfGoodsSold)==null?void 0:A.purchases)==null?void 0:y.amount)})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Freight In"}),e.jsx("span",{className:"font-semibold text-gray-900",children:i((P=t.costOfGoodsSold)==null?void 0:P.freightIn)})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Purchase Returns"}),e.jsxs("span",{className:"font-semibold text-green-600",children:["-",i((G=t.costOfGoodsSold)==null?void 0:G.purchaseReturns)]})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Purchase Discounts"}),e.jsxs("span",{className:"font-semibold text-green-600",children:["-",i((v=t.costOfGoodsSold)==null?void 0:v.purchaseDiscounts)]})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Ending Inventory"}),e.jsxs("span",{className:"font-semibold text-green-600",children:["-",i((f=t.costOfGoodsSold)==null?void 0:f.endingInventory)]})]})}),e.jsx("div",{className:"px-4 py-4 bg-red-50 border-t-2 border-red-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Total Cost of Goods Sold"}),e.jsx("span",{className:"text-xl font-bold text-red-600",children:i((w=(S=t.costOfGoodsSold)==null?void 0:S.totalCOGS)==null?void 0:w.amount)})]})})]})]}),e.jsx("div",{className:"bg-green-50 border-2 border-green-200 rounded-lg p-6",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-xl font-bold text-gray-900",children:"Gross Profit"}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"text-2xl font-bold text-green-600",children:i((M=t.grossProfit)==null?void 0:M.amount)}),e.jsxs("p",{className:"text-sm text-green-700",children:[d((X=t.grossProfit)==null?void 0:X.margin)," gross margin"]})]})]})}),e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(Ye,{className:"h-5 w-5 text-orange-500 mr-2"}),"Operating Expenses"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsxs("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:[e.jsx("span",{className:"font-semibold text-gray-900",children:"Selling Expenses"}),e.jsx("span",{className:"float-right font-semibold text-gray-900",children:i((r=(O=t.operatingExpenses)==null?void 0:O.sellingExpenses)==null?void 0:r.total)})]}),n&&((W=(we=(l=t.operatingExpenses)==null?void 0:l.sellingExpenses)==null?void 0:we.details)==null?void 0:W.length)>0&&e.jsx("div",{className:"px-4 py-2 bg-gray-25",children:t.operatingExpenses.sellingExpenses.details.map((m,u)=>e.jsxs("div",{className:"flex justify-between items-center py-1 text-sm",children:[e.jsx("span",{className:"text-gray-600 ml-4",children:m.category.replace("_"," ")}),e.jsx("span",{className:"text-gray-900",children:i(m.amount)})]},u))}),e.jsxs("div",{className:"px-4 py-3 border-b border-gray-200",children:[e.jsx("span",{className:"font-semibold text-gray-900",children:"Administrative Expenses"}),e.jsx("span",{className:"float-right font-semibold text-gray-900",children:i((ye=(Ee=t.operatingExpenses)==null?void 0:Ee.administrativeExpenses)==null?void 0:ye.total)})]}),n&&((H=(fe=(F=t.operatingExpenses)==null?void 0:F.administrativeExpenses)==null?void 0:fe.details)==null?void 0:H.length)>0&&e.jsx("div",{className:"px-4 py-2 bg-gray-25",children:t.operatingExpenses.administrativeExpenses.details.map((m,u)=>e.jsxs("div",{className:"flex justify-between items-center py-1 text-sm",children:[e.jsx("span",{className:"text-gray-600 ml-4",children:m.category.replace("_"," ")}),e.jsx("span",{className:"text-gray-900",children:i(m.amount)})]},u))}),e.jsx("div",{className:"px-4 py-4 bg-orange-50 border-t-2 border-orange-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Total Operating Expenses"}),e.jsx("span",{className:"text-xl font-bold text-orange-600",children:i((Q=(J=t.operatingExpenses)==null?void 0:J.totalOperatingExpenses)==null?void 0:Q.amount)})]})})]})]}),e.jsx("div",{className:"bg-purple-50 border-2 border-purple-200 rounded-lg p-6",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-xl font-bold text-gray-900",children:"Operating Income"}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:`text-2xl font-bold ${T((K=t.operatingIncome)==null?void 0:K.amount)}`,children:i((Z=t.operatingIncome)==null?void 0:Z.amount)}),e.jsxs("p",{className:"text-sm text-purple-700",children:[d((ee=t.operatingIncome)==null?void 0:ee.margin)," operating margin"]})]})]})}),e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(hs,{className:"h-5 w-5 text-indigo-500 mr-2"}),"Other Income and Expenses"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsxs("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Other Income"}),e.jsx("span",{className:"float-right font-semibold text-green-600",children:i((te=(se=t.otherIncome)==null?void 0:se.totalOtherIncome)==null?void 0:te.amount)})]}),e.jsxs("div",{className:"px-4 py-3 border-b border-gray-200",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Other Expenses"}),e.jsx("span",{className:"float-right font-semibold text-red-600",children:i((re=(ae=t.otherExpenses)==null?void 0:ae.totalOtherExpenses)==null?void 0:re.amount)})]}),e.jsx("div",{className:"px-4 py-4 bg-indigo-50 border-t-2 border-indigo-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Earnings Before Tax"}),e.jsx("span",{className:`text-xl font-bold ${T((ne=t.earningsBeforeTax)==null?void 0:ne.amount)}`,children:i((le=t.earningsBeforeTax)==null?void 0:le.amount)})]})})]})]}),e.jsx("div",{className:"bg-gray-50 border border-gray-200 rounded-lg p-6",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Income Tax"}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"text-xl font-bold text-gray-900",children:i((oe=(ie=t.incomeTax)==null?void 0:ie.total)==null?void 0:oe.amount)}),e.jsxs("p",{className:"text-sm text-gray-600",children:[d((ce=(de=t.incomeTax)==null?void 0:de.total)==null?void 0:ce.rate)," tax rate"]})]})]})}),e.jsx("div",{className:"bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-8",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-2xl font-bold text-gray-900",children:"Net Income"}),e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:"After all expenses and taxes"})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:`text-3xl font-bold ${T((me=t.netIncome)==null?void 0:me.amount)}`,children:i((xe=t.netIncome)==null?void 0:xe.amount)}),e.jsxs("p",{className:"text-sm text-green-700 mt-1",children:[d((ge=t.netIncome)==null?void 0:ge.margin)," net margin"]})]})]})})]}),t.keyMetrics&&e.jsxs("div",{className:"mt-8 bg-gray-50 rounded-lg p-6",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Key Performance Metrics"}),e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Gross Profit Margin"}),e.jsx("p",{className:"text-lg font-semibold text-green-600",children:d(t.keyMetrics.grossProfitMargin)})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Operating Margin"}),e.jsx("p",{className:"text-lg font-semibold text-purple-600",children:d(t.keyMetrics.operatingMargin)})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Net Profit Margin"}),e.jsx("p",{className:"text-lg font-semibold text-green-600",children:d(t.keyMetrics.netProfitMargin)})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"EBITDA"}),e.jsx("p",{className:"text-lg font-semibold text-blue-600",children:i(t.keyMetrics.ebitda)})]})]})]}),t.comparison&&e.jsxs("div",{className:"mt-8 bg-blue-50 rounded-lg p-6",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Period Comparisons"}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[t.comparison.previousPeriod&&e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-gray-900 mb-2",children:"vs Previous Period"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Previous Net Income:"}),e.jsx("span",{className:"font-medium",children:i(t.comparison.previousPeriod.netIncome)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Change:"}),e.jsxs("span",{className:`font-medium ${T(t.comparison.previousPeriod.change)}`,children:[i(t.comparison.previousPeriod.change),"(",d(t.comparison.previousPeriod.changePercent),")"]})]})]})]}),t.comparison.budget&&e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-gray-900 mb-2",children:"vs Budget"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Budgeted Net Income:"}),e.jsx("span",{className:"font-medium",children:i(t.comparison.budget.netIncome)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Variance:"}),e.jsxs("span",{className:`font-medium ${T(t.comparison.budget.variance)}`,children:[i(t.comparison.budget.variance),"(",d(t.comparison.budget.variancePercent),")"]})]})]})]})]})]}),t.notes&&t.notes.length>0&&e.jsxs("div",{className:"mt-8",children:[e.jsxs("button",{onClick:()=>x(!p),className:"flex items-center text-gray-600 hover:text-gray-900 mb-4",children:[e.jsxs("span",{className:"mr-2",children:[p?"Hide":"Show"," Notes"]}),p?e.jsx(ts,{className:"h-4 w-4"}):e.jsx(We,{className:"h-4 w-4"})]}),p&&e.jsxs("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4",children:[e.jsx("h4",{className:"font-medium text-gray-900 mb-2",children:"Statement Notes"}),e.jsx("div",{className:"space-y-2",children:t.notes.map((m,u)=>e.jsxs("div",{className:"text-sm text-gray-700",children:[e.jsxs("span",{className:"font-medium",children:[m.section,":"]})," ",m.note,m.amount&&e.jsxs("span",{className:"ml-2 font-medium text-gray-900",children:["(",i(m.amount),")"]}),e.jsxs("span",{className:"ml-2 text-gray-500",children:["- ",D(m.date)]})]},u))})]})]}),e.jsx("div",{className:"mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsxs("p",{children:["Generated on ",D(t.createdAt)]}),t.generatedBy&&e.jsxs("p",{children:["Generated by: ",t.generatedBy.firstName," ",t.generatedBy.lastName]})]}),e.jsxs("div",{children:[t.approvedBy&&e.jsxs("p",{children:["Approved by: ",t.approvedBy.firstName," ",t.approvedBy.lastName]}),t.approvedAt&&e.jsxs("p",{children:["Approved on: ",D(t.approvedAt)]})]})]})})]})]})},Ps=({statement:t,onView:o,onEdit:g,onDelete:n,onExport:c})=>{var Ne,j,ue,T,V,q,pe,he,ve,be,Se;const p=C=>`$${(C==null?void 0:C.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}))||"0.00"}`,x=C=>new Date(C).toLocaleDateString(),i=C=>{switch(C){case"published":return e.jsx(ze,{className:"h-4 w-4 text-green-500"});case"approved":return e.jsx(ze,{className:"h-4 w-4 text-blue-500"});case"review":return e.jsx(ns,{className:"h-4 w-4 text-yellow-500"});case"draft":return e.jsx(Be,{className:"h-4 w-4 text-gray-500"});default:return e.jsx(Je,{className:"h-4 w-4 text-red-500"})}},d=C=>{switch(C){case"published":return"text-green-600 bg-green-50 border-green-200";case"approved":return"text-blue-600 bg-blue-50 border-blue-200";case"review":return"text-yellow-600 bg-yellow-50 border-yellow-200";case"draft":return"text-gray-600 bg-gray-50 border-gray-200";default:return"text-red-600 bg-red-50 border-red-200"}},D=((Ne=t.netIncome)==null?void 0:Ne.amount)||0,U=D>=0;return e.jsx("div",{className:"bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"P&L Statement"}),e.jsxs("p",{className:"text-sm text-gray-600",children:[x((j=t.period)==null?void 0:j.startDate)," - ",x((ue=t.period)==null?void 0:ue.endDate)]})]}),e.jsxs("div",{className:`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${d(t.status)}`,children:[i(t.status),e.jsx("span",{className:"ml-1 capitalize",children:t.status})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-500 uppercase tracking-wide",children:"Total Revenue"}),e.jsx("p",{className:"text-lg font-semibold text-gray-900",children:p((V=(T=t.revenue)==null?void 0:T.totalRevenue)==null?void 0:V.amount)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-500 uppercase tracking-wide",children:"Net Income"}),e.jsxs("div",{className:"flex items-center",children:[U?e.jsx(Xe,{className:"h-4 w-4 text-green-500 mr-1"}):e.jsx(Ye,{className:"h-4 w-4 text-red-500 mr-1"}),e.jsx("p",{className:`text-lg font-semibold ${U?"text-green-600":"text-red-600"}`,children:p(Math.abs(D))})]})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 mb-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Gross Margin"}),e.jsxs("p",{className:"text-sm font-medium text-gray-900",children:[((pe=(q=t.grossProfit)==null?void 0:q.margin)==null?void 0:pe.toFixed(1))||"0.0","%"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Operating Margin"}),e.jsxs("p",{className:"text-sm font-medium text-gray-900",children:[((ve=(he=t.operatingIncome)==null?void 0:he.margin)==null?void 0:ve.toFixed(1))||"0.0","%"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Net Margin"}),e.jsxs("p",{className:"text-sm font-medium text-gray-900",children:[((Se=(be=t.netIncome)==null?void 0:be.margin)==null?void 0:Se.toFixed(1))||"0.0","%"]})]})]}),e.jsxs("div",{className:"flex items-center justify-between pt-4 border-t border-gray-100",children:[e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("button",{onClick:()=>o(t),className:"p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",title:"View Details",children:e.jsx(We,{className:"h-4 w-4"})}),t.status==="draft"&&e.jsx("button",{onClick:()=>g(t),className:"p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors",title:"Edit Statement",children:e.jsx(Be,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>c(t),className:"p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",title:"Export Statement",children:e.jsx(He,{className:"h-4 w-4"})})]}),t.status==="draft"&&e.jsx("button",{onClick:()=>n(t),className:"p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",title:"Delete Statement",children:e.jsx(ys,{className:"h-4 w-4"})})]})]})})},Os=({isOpen:t,onClose:o,onGenerate:g})=>{const[n,c]=z.useState({startDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().split("T")[0],endDate:new Date(new Date().getFullYear(),new Date().getMonth()+1,0).toISOString().split("T")[0],periodType:"monthly",includeDetails:!0,calculateComparisons:!0,companyInfo:{name:"",address:"",taxId:""}}),p=x=>{if(x.preventDefault(),!n.startDate||!n.endDate){Re("Please select both start and end dates");return}if(new Date(n.startDate)>new Date(n.endDate)){Re("Start date cannot be after end date");return}let i={...n};if(n.startDate===n.endDate){const d=new Date(n.endDate);d.setDate(d.getDate()+1),i.endDate=d.toISOString().split("T")[0]}g(i)};return t?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",children:e.jsx("div",{className:"bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-6",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"Generate P&L Statement"}),e.jsx("button",{onClick:o,className:"text-gray-400 hover:text-gray-600",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsxs("form",{onSubmit:p,className:"space-y-6",children:[e.jsx("div",{className:"mb-2",children:e.jsxs("p",{className:"text-sm text-gray-600",children:[e.jsx("strong",{children:"Note:"})," You can select the same date for both start and end to generate a single-day statement."]})}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Start Date"}),e.jsx("input",{type:"date",value:n.startDate,onChange:x=>c({...n,startDate:x.target.value}),className:"input",required:!0})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"End Date"}),e.jsx("input",{type:"date",value:n.endDate,onChange:x=>c({...n,endDate:x.target.value}),className:"input",required:!0})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Period Type"}),e.jsxs("select",{value:n.periodType,onChange:x=>c({...n,periodType:x.target.value}),className:"input",children:[e.jsx("option",{value:"monthly",children:"Monthly"}),e.jsx("option",{value:"quarterly",children:"Quarterly"}),e.jsx("option",{value:"yearly",children:"Yearly"}),e.jsx("option",{value:"custom",children:"Custom"})]})]}),e.jsxs("div",{className:"border-t pt-6",children:[e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Company Information"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Company Name"}),e.jsx("input",{type:"text",value:n.companyInfo.name,onChange:x=>c({...n,companyInfo:{...n.companyInfo,name:x.target.value}}),className:"input",placeholder:"Enter company name"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Address"}),e.jsx("textarea",{value:n.companyInfo.address,onChange:x=>c({...n,companyInfo:{...n.companyInfo,address:x.target.value}}),className:"input",rows:"3",placeholder:"Enter company address"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Tax ID"}),e.jsx("input",{type:"text",value:n.companyInfo.taxId,onChange:x=>c({...n,companyInfo:{...n.companyInfo,taxId:x.target.value}}),className:"input",placeholder:"Enter tax ID"})]})]})]}),e.jsxs("div",{className:"border-t pt-6",children:[e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Options"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:n.includeDetails,onChange:x=>c({...n,includeDetails:x.target.checked}),className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),e.jsx("span",{className:"ml-2 text-sm text-gray-700",children:"Include detailed breakdowns"})]}),e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:n.calculateComparisons,onChange:x=>c({...n,calculateComparisons:x.target.checked}),className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),e.jsx("span",{className:"ml-2 text-sm text-gray-700",children:"Calculate period comparisons"})]})]})]}),e.jsxs("div",{className:"flex justify-end space-x-3 pt-6 border-t",children:[e.jsx("button",{type:"button",onClick:o,className:"btn btn-secondary",children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn btn-primary",children:"Generate Statement"})]})]})]})})}):null},Ts=({isOpen:t,onClose:o,onUpdate:g,statement:n})=>{const[c,p]=z.useState({title:"",description:"",status:"draft",tags:[],notes:""});ls.useEffect(()=>{n&&p({title:n.title||"",description:n.description||"",status:n.status||"draft",tags:n.tags||[],notes:n.notes||""})},[n]);const x=d=>{d.preventDefault(),g(c)},i=(d,D)=>{p(U=>({...U,[d]:D}))};return t?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex justify-between items-center p-6 border-b border-gray-200",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"Edit P&L Statement"}),e.jsx("button",{onClick:o,className:"text-gray-400 hover:text-gray-600 transition-colors",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsx("div",{className:"p-6",children:e.jsxs("form",{onSubmit:x,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Statement Title"}),e.jsx("input",{type:"text",value:c.title,onChange:d=>i("title",d.target.value),className:"input w-full",placeholder:"Enter statement title",required:!0})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Description"}),e.jsx("textarea",{value:c.description,onChange:d=>i("description",d.target.value),className:"input w-full h-24",placeholder:"Enter statement description",rows:3})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Status"}),e.jsxs("select",{value:c.status,onChange:d=>i("status",d.target.value),className:"input w-full",children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"review",children:"Under Review"}),e.jsx("option",{value:"approved",children:"Approved"}),e.jsx("option",{value:"published",children:"Published"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Notes"}),e.jsx("textarea",{value:c.notes,onChange:d=>i("notes",d.target.value),className:"input w-full h-32",placeholder:"Add any additional notes or comments",rows:4})]}),e.jsxs("div",{className:"flex justify-end space-x-3 pt-4 border-t border-gray-200",children:[e.jsx("button",{type:"button",onClick:o,className:"btn btn-secondary",children:"Cancel"}),e.jsxs("button",{type:"submit",className:"btn btn-primary",children:[e.jsx(Be,{className:"h-4 w-4 mr-2"}),"Update Statement"]})]})]})})]})}):null},Cs=({isOpen:t,onClose:o,onExport:g,statement:n})=>{const[c,p]=z.useState({format:"pdf",includeDetails:!0,includeCharts:!1,includeNotes:!0}),x=d=>{d.preventDefault(),g(c.format,c.includeDetails)},i=(d,D)=>{p(U=>({...U,[d]:D}))};return t?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-md w-full",children:[e.jsxs("div",{className:"flex justify-between items-center p-6 border-b border-gray-200",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"Export P&L Statement"}),e.jsx("button",{onClick:o,className:"text-gray-400 hover:text-gray-600 transition-colors",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsx("div",{className:"p-6",children:e.jsxs("form",{onSubmit:x,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-3",children:"Export Format"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"pdf",checked:c.format==="pdf",onChange:d=>i("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"PDF"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Print-ready format"})]})]}),e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"excel",checked:c.format==="excel",onChange:d=>i("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"Excel"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Spreadsheet format"})]})]}),e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"csv",checked:c.format==="csv",onChange:d=>i("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"CSV"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Comma-separated values"})]})]}),e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"json",checked:c.format==="json",onChange:d=>i("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"JSON"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Data format"})]})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-3",children:"Export Options"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:c.includeDetails,onChange:d=>i("includeDetails",d.target.checked),className:"mr-3"}),e.jsx("span",{className:"text-sm text-gray-700",children:"Include detailed breakdown"})]}),e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:c.includeCharts,onChange:d=>i("includeCharts",d.target.checked),className:"mr-3"}),e.jsx("span",{className:"text-sm text-gray-700",children:"Include charts and graphs"})]}),e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:c.includeNotes,onChange:d=>i("includeNotes",d.target.checked),className:"mr-3"}),e.jsx("span",{className:"text-sm text-gray-700",children:"Include notes and comments"})]})]})]}),e.jsxs("div",{className:"flex justify-end space-x-3 pt-4 border-t border-gray-200",children:[e.jsx("button",{type:"button",onClick:o,className:"btn btn-secondary",children:"Cancel"}),e.jsxs("button",{type:"submit",className:"btn btn-primary",children:[e.jsx(He,{className:"h-4 w-4 mr-2"}),"Export Statement"]})]})]})})]})}):null},Ys=()=>{var Ie,Pe;const[t,o]=z.useState({page:1,limit:12,periodType:"",status:"",startDate:"",endDate:""}),[g,n]=z.useState(!1),[c,p]=z.useState(null),[x,i]=z.useState(!1),[d,D]=z.useState(!1),[U,Ne]=z.useState(!1);ds();const{data:j,isLoading:ue,error:T,refetch:V}=vs(t,{onError:s=>qe(s,"P&L Statements")}),{data:q}=Ss(c==null?void 0:c._id,{skip:!(c!=null&&c._id)}),[pe]=Ns(),[he]=Ds(),[ve]=$s(),[be]=ws(),[Se]=Es();ls.useEffect(()=>{q!=null&&q.data&&p(q.data)},[q]);const C=async s=>{var h,b;try{await pe(s).unwrap(),je("P&L statement generated successfully!"),n(!1),V()}catch(a){(h=a==null?void 0:a.data)!=null&&h.message?Re(a.data.message):(b=a==null?void 0:a.message)!=null&&b.includes("input")?Re("Please check your input and try again. Make sure dates are valid."):qe(a,"P&L Statement Generation")}},ke=s=>{p(s)},Le=s=>{p(s),i(!0)},Ae=async s=>{if(window.confirm("Are you sure you want to delete this P&L statement?"))try{await he(s._id).unwrap(),je("P&L statement deleted successfully!"),V()}catch(h){qe(h,"P&L Statement Deletion")}},De=s=>{p(s),D(!0)},Ge=async s=>{try{await be({id:c._id,...s}).unwrap(),je("P&L statement updated successfully!"),i(!1),p(null),V()}catch(h){qe(h,"P&L Statement Update")}},Me=(s,h=!0)=>{if(!c)return;new Date().toISOString();const a=`P&L_Statement_${`${c.startDate||"start"}_${c.endDate||"end"}`}_${new Date().toISOString().split("T")[0]}`;s==="pdf"?Fe(c,a):s==="excel"||s==="csv"?_e(c,a,s):s==="json"&&Ue(c,a),D(!1),p(null),je(`P&L statement exported as ${s.toUpperCase()} successfully!`)},Fe=(s,h)=>{var ye,F,fe,H,J,Q,K,Z,ee,se,te,ae,re,ne,le,ie,oe,de,ce,me,xe,ge,m,u,_,Oe,Te,Ce;const b=window.open("","_blank"),a=((F=(ye=s.revenue)==null?void 0:ye.totalRevenue)==null?void 0:F.amount)||0;let N=((fe=s.costOfGoodsSold)==null?void 0:fe.beginningInventory)||s.beginningInventory||((H=s.inventory)==null?void 0:H.beginning)||0,I=((Q=(J=s.costOfGoodsSold)==null?void 0:J.purchases)==null?void 0:Q.amount)||((K=s.costOfGoodsSold)==null?void 0:K.purchases)||((Z=s.purchases)==null?void 0:Z.amount)||s.purchases||((ee=s.purchaseData)==null?void 0:ee.total)||0,R=((se=s.costOfGoodsSold)==null?void 0:se.freightIn)||s.freightIn||((te=s.shipping)==null?void 0:te.freight)||0,k=((ae=s.costOfGoodsSold)==null?void 0:ae.purchaseReturns)||s.purchaseReturns||((re=s.returns)==null?void 0:re.purchases)||0,L=((ne=s.costOfGoodsSold)==null?void 0:ne.purchaseDiscounts)||s.purchaseDiscounts||((le=s.discounts)==null?void 0:le.purchases)||0,A=((ie=s.costOfGoodsSold)==null?void 0:ie.endingInventory)||s.endingInventory||((oe=s.inventory)==null?void 0:oe.ending)||0,y=N+I+R-k-L-A;if(y===0&&(y=((de=s.costOfGoodsSold)==null?void 0:de.amount)||s.costOfGoodsSold||s.totalCostOfGoodsSold||0),y===0&&a>0){const E=((ce=s.grossProfit)==null?void 0:ce.amount)||0;y=a-E}const P=((me=s.grossProfit)==null?void 0:me.amount)||a-y,G=((xe=s.operatingExpenses)==null?void 0:xe.amount)||0,v=((ge=s.operatingIncome)==null?void 0:ge.amount)||P-G,f=((m=s.otherIncome)==null?void 0:m.amount)||0,S=((u=s.otherExpenses)==null?void 0:u.amount)||0,w=((_=s.netIncome)==null?void 0:_.amount)||v+f-S,M=((Oe=s.grossProfit)==null?void 0:Oe.margin)||(a>0?P/a*100:0),X=((Te=s.operatingIncome)==null?void 0:Te.margin)||(a>0?v/a*100:0),O=((Ce=s.netIncome)==null?void 0:Ce.margin)||(a>0?w/a*100:0),r=(E,Y)=>Y===0||isNaN(Y)||isNaN(E)?"0.0":(E/Y*100).toFixed(1),l=E=>isNaN(E)||E===null||E===void 0?"$0":`$${Number(E).toLocaleString()}`,we=(E,Y)=>{var Ze,es;const Qe=((Ze=s.period)==null?void 0:Ze.startDate)||E,Ke=((es=s.period)==null?void 0:es.endDate)||Y;return!Qe||!Ke?"N/A - N/A":W(Qe)+" - "+W(Ke)},W=E=>{if(!E)return"N/A";try{const Y=new Date(E);return isNaN(Y.getTime())?"N/A":Y.toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"})}catch{return"N/A"}},Ee=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Detailed P&L Statement - ${h}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #1f2937;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .statement-title { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 10px;
          }
          .statement-period { 
            font-size: 18px; 
            color: #6b7280; 
            margin-bottom: 5px;
          }
          .company-info {
            font-size: 14px;
            color: #6b7280;
            margin-top: 10px;
          }
          .pl-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            font-size: 14px;
          }
          .pl-table th {
            background-color: #f9fafb;
            padding: 12px 15px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #e5e7eb;
            color: #374151;
          }
          .pl-table td {
            padding: 10px 15px;
            border: 1px solid #e5e7eb;
          }
          .pl-table .section-header {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #1f2937;
          }
          .pl-table .subsection-header {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            padding-left: 30px;
          }
          .pl-table .line-item {
            padding-left: 45px;
            color: #6b7280;
          }
          .pl-table .total-line {
            font-weight: bold;
            background-color: #f0f9ff;
            color: #1e40af;
          }
          .pl-table .net-income {
            font-weight: bold;
            background-color: #f0fdf4;
            color: #166534;
            font-size: 16px;
          }
          .pl-table .negative-net {
            background-color: #fef2f2;
            color: #dc2626;
          }
          .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
          }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .summary-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .summary-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="statement-title">PROFIT & LOSS STATEMENT</div>
          <div class="statement-period">For the period: ${we(s.startDate,s.endDate)}</div>
          <div class="company-info">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <table class="pl-table">
          <thead>
            <tr>
              <th style="width: 60%;">Description</th>
              <th style="width: 20%; text-align: right;">Amount</th>
              <th style="width: 20%; text-align: right;">% of Revenue</th>
            </tr>
          </thead>
          <tbody>
            <!-- REVENUE SECTION -->
            <tr class="section-header">
              <td colspan="3">REVENUE</td>
            </tr>
            <tr class="subsection-header">
              <td>Sales Revenue</td>
              <td class="amount">${l(a)}</td>
              <td class="amount">100.0%</td>
            </tr>
            <tr class="line-item">
              <td>Product Sales</td>
              <td class="amount">${l(s.productSales||a)}</td>
              <td class="amount">${r(s.productSales||a,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Service Revenue</td>
              <td class="amount">${l(s.serviceRevenue||0)}</td>
              <td class="amount">${r(s.serviceRevenue||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Other Revenue</td>
              <td class="amount">${l(s.otherRevenue||0)}</td>
              <td class="amount">${r(s.otherRevenue||0,a)}%</td>
            </tr>
            <tr class="total-line">
              <td><strong>TOTAL REVENUE</strong></td>
              <td class="amount"><strong>${l(a)}</strong></td>
              <td class="amount"><strong>100.0%</strong></td>
            </tr>
            
              <!-- COST OF GOODS SOLD -->
              <tr class="section-header">
                <td colspan="3">COST OF GOODS SOLD</td>
              </tr>
              <tr class="line-item">
                <td>Beginning Inventory</td>
                <td class="amount">${l(N)}</td>
                <td class="amount">${r(N,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Purchases</td>
                <td class="amount">${l(I)}</td>
                <td class="amount">${r(I,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Freight In</td>
                <td class="amount">${l(R)}</td>
                <td class="amount">${r(R,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Less: Purchase Returns</td>
                <td class="amount">${l(-k)}</td>
                <td class="amount">${r(-k,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Less: Purchase Discounts</td>
                <td class="amount">${l(-L)}</td>
                <td class="amount">${r(-L,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Less: Ending Inventory</td>
                <td class="amount">${l(-A)}</td>
                <td class="amount">${r(-A,a)}%</td>
              </tr>
              <tr class="total-line">
                <td><strong>TOTAL COST OF GOODS SOLD</strong></td>
                <td class="amount"><strong>${l(y)}</strong></td>
                <td class="amount"><strong>${r(y,a)}%</strong></td>
              </tr>
            
            <!-- GROSS PROFIT -->
            <tr class="total-line">
              <td><strong>GROSS PROFIT</strong></td>
              <td class="amount"><strong>${l(P)}</strong></td>
              <td class="amount"><strong>${r(P,a)}%</strong></td>
            </tr>
            
            <!-- OPERATING EXPENSES -->
            <tr class="section-header">
              <td colspan="3">OPERATING EXPENSES</td>
            </tr>
            <tr class="subsection-header">
              <td>Selling Expenses</td>
              <td class="amount">${l(s.sellingExpenses||0)}</td>
              <td class="amount">${r(s.sellingExpenses||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Sales & Marketing</td>
              <td class="amount">${l(s.salesMarketing||0)}</td>
              <td class="amount">${r(s.salesMarketing||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Advertising</td>
              <td class="amount">${l(s.advertising||0)}</td>
              <td class="amount">${r(s.advertising||0,a)}%</td>
            </tr>
            <tr class="subsection-header">
              <td>General & Administrative</td>
              <td class="amount">${l(s.generalAdmin||0)}</td>
              <td class="amount">${r(s.generalAdmin||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Salaries & Wages</td>
              <td class="amount">${l(s.salariesWages||0)}</td>
              <td class="amount">${r(s.salariesWages||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Rent & Utilities</td>
              <td class="amount">${l(s.rentUtilities||0)}</td>
              <td class="amount">${r(s.rentUtilities||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Professional Services</td>
              <td class="amount">${l(s.professionalServices||0)}</td>
              <td class="amount">${r(s.professionalServices||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Insurance</td>
              <td class="amount">${l(s.insurance||0)}</td>
              <td class="amount">${r(s.insurance||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Depreciation</td>
              <td class="amount">${l(s.depreciation||0)}</td>
              <td class="amount">${r(s.depreciation||0,a)}%</td>
            </tr>
            <tr class="total-line">
              <td><strong>TOTAL OPERATING EXPENSES</strong></td>
              <td class="amount"><strong>${l(G)}</strong></td>
              <td class="amount"><strong>${r(G,a)}%</strong></td>
            </tr>
            
            <!-- OPERATING INCOME -->
            <tr class="total-line">
              <td><strong>OPERATING INCOME</strong></td>
              <td class="amount"><strong>${l(v)}</strong></td>
              <td class="amount"><strong>${r(v,a)}%</strong></td>
            </tr>
            
            <!-- OTHER INCOME/EXPENSES -->
            <tr class="section-header">
              <td colspan="3">OTHER INCOME & EXPENSES</td>
            </tr>
            <tr class="line-item">
              <td>Interest Income</td>
              <td class="amount">${l(s.interestIncome||0)}</td>
              <td class="amount">${r(s.interestIncome||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Interest Expense</td>
              <td class="amount">${l(s.interestExpense||0)}</td>
              <td class="amount">${r(s.interestExpense||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Other Income</td>
              <td class="amount">${l(f)}</td>
              <td class="amount">${r(f,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Other Expenses</td>
              <td class="amount">${l(S)}</td>
              <td class="amount">${r(S,a)}%</td>
            </tr>
            
            <!-- NET INCOME -->
            <tr class="net-income ${w>=0?"":"negative-net"}">
              <td><strong>NET INCOME</strong></td>
              <td class="amount"><strong>${l(w)}</strong></td>
              <td class="amount"><strong>${r(w,a)}%</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Gross Margin</div>
            <div class="summary-value">${M.toFixed(1)}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Operating Margin</div>
            <div class="summary-value">${X.toFixed(1)}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Net Margin</div>
            <div class="summary-value">${O.toFixed(1)}%</div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Note:</strong> This Profit & Loss Statement has been generated automatically from your business data.</p>
          <p>For questions about this statement, please contact your accounting department.</p>
        </div>
      </body>
      </html>
    `;b.document.write(Ee),b.document.close(),b.focus(),b.print()},_e=(s,h,b)=>{var H,J,Q,K,Z,ee,se,te,ae,re,ne,le,ie,oe,de,ce,me,xe,ge,m;const a=((J=(H=s.revenue)==null?void 0:H.totalRevenue)==null?void 0:J.amount)||0;let N=((Q=s.costOfGoodsSold)==null?void 0:Q.beginningInventory)||0,I=((Z=(K=s.costOfGoodsSold)==null?void 0:K.purchases)==null?void 0:Z.amount)||0,R=((ee=s.costOfGoodsSold)==null?void 0:ee.freightIn)||0,k=((se=s.costOfGoodsSold)==null?void 0:se.purchaseReturns)||0,L=((te=s.costOfGoodsSold)==null?void 0:te.purchaseDiscounts)||0,A=((ae=s.costOfGoodsSold)==null?void 0:ae.endingInventory)||0,y=N+I+R-k-L-A;if(y===0&&(y=((re=s.costOfGoodsSold)==null?void 0:re.amount)||s.costOfGoodsSold||s.totalCostOfGoodsSold||0),y===0&&a>0){const u=((ne=s.grossProfit)==null?void 0:ne.amount)||0;y=a-u}const P=((le=s.grossProfit)==null?void 0:le.amount)||a-y,G=((ie=s.operatingExpenses)==null?void 0:ie.amount)||0,v=((oe=s.operatingIncome)==null?void 0:oe.amount)||P-G,f=((de=s.otherIncome)==null?void 0:de.amount)||0,S=((ce=s.otherExpenses)==null?void 0:ce.amount)||0,w=((me=s.netIncome)==null?void 0:me.amount)||v+f-S,M=((xe=s.grossProfit)==null?void 0:xe.margin)||(a>0?P/a*100:0),X=((ge=s.operatingIncome)==null?void 0:ge.margin)||(a>0?v/a*100:0),O=((m=s.netIncome)==null?void 0:m.margin)||(a>0?w/a*100:0),r=(u,_)=>_===0||isNaN(_)||isNaN(u)?"0.0":(u/_*100).toFixed(1),l=u=>isNaN(u)||u===null||u===void 0?"$0":`$${Number(u).toLocaleString()}`,we=(u,_)=>{var Ce,E;const Oe=((Ce=s.period)==null?void 0:Ce.startDate)||u,Te=((E=s.period)==null?void 0:E.endDate)||_;return!Oe||!Te?"N/A to N/A":W(Oe)+" to "+W(Te)},W=u=>{if(!u)return"N/A";try{const _=new Date(u);return isNaN(_.getTime())?"N/A":_.toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"})}catch{return"N/A"}},Ee=[["DETAILED PROFIT & LOSS STATEMENT"],["Generated:",new Date().toLocaleString()],["Period:",we(s.startDate,s.endDate)],[""],["Description","Amount","% of Revenue"],[""],["REVENUE","",""],["Sales Revenue",l(a),"100.0%"],["Product Sales",l(s.productSales||a),`${r(s.productSales||a,a)}%`],["Service Revenue",l(s.serviceRevenue||0),`${r(s.serviceRevenue||0,a)}%`],["Other Revenue",l(s.otherRevenue||0),`${r(s.otherRevenue||0,a)}%`],["TOTAL REVENUE",l(a),"100.0%"],[""],["COST OF GOODS SOLD","",""],["Beginning Inventory",l(N),`${r(N,a)}%`],["Purchases",l(I),`${r(I,a)}%`],["Freight In",l(R),`${r(R,a)}%`],["Less: Purchase Returns",l(-k),`${r(-k,a)}%`],["Less: Purchase Discounts",l(-L),`${r(-L,a)}%`],["Less: Ending Inventory",l(-A),`${r(-A,a)}%`],["TOTAL COST OF GOODS SOLD",l(y),`${r(y,a)}%`],[""],["GROSS PROFIT",l(P),`${r(P,a)}%`],[""],["OPERATING EXPENSES","",""],["Selling Expenses",l(s.sellingExpenses||0),`${r(s.sellingExpenses||0,a)}%`],["Sales & Marketing",l(s.salesMarketing||0),`${r(s.salesMarketing||0,a)}%`],["Advertising",l(s.advertising||0),`${r(s.advertising||0,a)}%`],["General & Administrative",l(s.generalAdmin||0),`${r(s.generalAdmin||0,a)}%`],["Salaries & Wages",l(s.salariesWages||0),`${r(s.salariesWages||0,a)}%`],["Rent & Utilities",l(s.rentUtilities||0),`${r(s.rentUtilities||0,a)}%`],["Professional Services",l(s.professionalServices||0),`${r(s.professionalServices||0,a)}%`],["Insurance",l(s.insurance||0),`${r(s.insurance||0,a)}%`],["Depreciation",l(s.depreciation||0),`${r(s.depreciation||0,a)}%`],["TOTAL OPERATING EXPENSES",l(G),`${r(G,a)}%`],[""],["OPERATING INCOME",l(v),`${r(v,a)}%`],[""],["OTHER INCOME & EXPENSES","",""],["Interest Income",l(s.interestIncome||0),`${r(s.interestIncome||0,a)}%`],["Interest Expense",l(s.interestExpense||0),`${r(s.interestExpense||0,a)}%`],["Other Income",l(f),`${r(f,a)}%`],["Other Expenses",l(S),`${r(S,a)}%`],[""],["NET INCOME",l(w),`${r(w,a)}%`],[""],["KEY RATIOS","",""],["Gross Margin",`${M.toFixed(1)}%`,""],["Operating Margin",`${X.toFixed(1)}%`,""],["Net Margin",`${O.toFixed(1)}%`,""]].map(u=>u.join(",")).join(`
`),ye=new Blob([Ee],{type:"text/csv;charset=utf-8;"}),F=document.createElement("a"),fe=URL.createObjectURL(ye);F.setAttribute("href",fe),F.setAttribute("download",`${h}.${b==="excel"?"csv":b}`),F.style.visibility="hidden",document.body.appendChild(F),F.click(),document.body.removeChild(F)},Ue=(s,h)=>{const b=JSON.stringify(s,null,2),a=new Blob([b],{type:"application/json;charset=utf-8;"}),N=document.createElement("a"),I=URL.createObjectURL(a);N.setAttribute("href",I),N.setAttribute("download",`${h}.json`),N.style.visibility="hidden",document.body.appendChild(N),N.click(),document.body.removeChild(N)},B=(s,h)=>{o(b=>({...b,[s]:h,page:1}))},$e=Array.isArray((Ie=j==null?void 0:j.data)==null?void 0:Ie.statements)?j.data.statements:Array.isArray(j==null?void 0:j.statements)?j.statements:[],$=((Pe=j==null?void 0:j.data)==null?void 0:Pe.pagination)||(j==null?void 0:j.pagination)||{current:1,pages:1,total:0,hasNext:!1,hasPrev:!1};return e.jsx(ps,{children:e.jsxs(cs,{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"P&L Statements"}),e.jsx("p",{className:"text-gray-600",children:"Generate and manage profit & loss statements"})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("button",{onClick:()=>Ne(!U),className:"btn btn-secondary",children:[e.jsx(bs,{className:"h-4 w-4 mr-2"}),"Filters"]}),e.jsxs("button",{onClick:()=>V(),className:"btn btn-secondary",children:[e.jsx(ms,{className:"h-4 w-4 mr-2"}),"Refresh"]}),e.jsxs("button",{onClick:()=>n(!0),className:"btn btn-primary btn-md",children:[e.jsx(rs,{className:"h-4 w-4 mr-2"}),"Generate Statement"]})]})]}),U&&e.jsx("div",{className:"bg-white p-4 rounded-lg border border-gray-200",children:e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Period Type"}),e.jsxs("select",{value:t.periodType,onChange:s=>B("periodType",s.target.value),className:"input",children:[e.jsx("option",{value:"",children:"All Periods"}),e.jsx("option",{value:"monthly",children:"Monthly"}),e.jsx("option",{value:"quarterly",children:"Quarterly"}),e.jsx("option",{value:"yearly",children:"Yearly"}),e.jsx("option",{value:"custom",children:"Custom"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Status"}),e.jsxs("select",{value:t.status,onChange:s=>B("status",s.target.value),className:"input",children:[e.jsx("option",{value:"",children:"All Statuses"}),e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"review",children:"Review"}),e.jsx("option",{value:"approved",children:"Approved"}),e.jsx("option",{value:"published",children:"Published"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Start Date"}),e.jsx("input",{type:"date",value:t.startDate,onChange:s=>B("startDate",s.target.value),className:"input"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"End Date"}),e.jsx("input",{type:"date",value:t.endDate,onChange:s=>B("endDate",s.target.value),className:"input"})]})]})}),ue&&e.jsx("div",{className:"flex items-center justify-center py-12",children:e.jsx(xs,{size:"lg"})}),T&&e.jsx("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(Je,{className:"h-5 w-5 text-red-500 mr-2"}),e.jsx("p",{className:"text-red-700",children:"Failed to load P&L statements. Please try again."})]})}),!ue&&!T&&e.jsx(e.Fragment,{children:$e.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(gs,{className:"mx-auto h-12 w-12 text-gray-400"}),e.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No P&L statements"}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Get started by generating your first P&L statement."}),e.jsx("div",{className:"mt-6",children:e.jsxs("button",{onClick:()=>n(!0),className:"btn btn-primary btn-md",children:[e.jsx(rs,{className:"h-4 w-4 mr-2"}),"Generate Statement"]})})]}):e.jsx(us,{cols:{default:1,sm:2,lg:3},gap:6,className:"space-y-6 lg:space-y-0",children:$e.map(s=>e.jsx(Ps,{statement:s,onView:ke,onEdit:Le,onDelete:Ae,onExport:De},s._id))})}),$.pages>1&&e.jsxs("div",{className:"flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200",children:[e.jsxs("div",{className:"flex-1 flex justify-between sm:hidden",children:[e.jsx("button",{onClick:()=>B("page",$.current-1),disabled:!$.hasPrev,className:"btn btn-secondary disabled:opacity-50",children:"Previous"}),e.jsx("button",{onClick:()=>B("page",$.current+1),disabled:!$.hasNext,className:"btn btn-secondary disabled:opacity-50",children:"Next"})]}),e.jsxs("div",{className:"hidden sm:flex-1 sm:flex sm:items-center sm:justify-between",children:[e.jsx("div",{children:e.jsxs("p",{className:"text-sm text-gray-700",children:["Showing page ",e.jsx("span",{className:"font-medium",children:$.current})," of"," ",e.jsx("span",{className:"font-medium",children:$.pages})," (",$.total," total statements)"]})}),e.jsx("div",{children:e.jsxs("nav",{className:"relative z-0 inline-flex rounded-md shadow-sm -space-x-px",children:[e.jsx("button",{onClick:()=>B("page",$.current-1),disabled:!$.hasPrev,className:"relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50",children:"Previous"}),e.jsx("button",{onClick:()=>B("page",$.current+1),disabled:!$.hasNext,className:"relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50",children:"Next"})]})})]})]}),e.jsx(Os,{isOpen:g,onClose:()=>n(!1),onGenerate:C}),c&&!x&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex justify-between items-center p-6 border-b border-gray-200",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"P&L Statement Details"}),e.jsx("button",{onClick:()=>p(null),className:"text-gray-400 hover:text-gray-600 transition-colors",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsx("div",{className:"p-6",children:e.jsx(Is,{statement:c,onExport:De,onShare:async s=>{var h,b,a,N,I,R,k,L,A,y,P,G;try{const v=O=>O?new Date(O).toLocaleDateString():"",f=O=>`$${(O==null?void 0:O.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}))||"0.00"}`,S=((h=s.period)==null?void 0:h.startDate)||s.startDate,w=((b=s.period)==null?void 0:b.endDate)||s.endDate,M=s.title||`P&L Statement - ${v(S)} to ${v(w)}`,X=`${M}

Period: ${v(S)} to ${v(w)}
Total Revenue: ${f(((N=(a=s.revenue)==null?void 0:a.totalRevenue)==null?void 0:N.amount)||0)}
Gross Profit: ${f(((I=s.grossProfit)==null?void 0:I.amount)||0)}
Net Profit: ${f(((R=s.netProfit)==null?void 0:R.amount)||0)}

Generated on ${v(new Date)}`;navigator.share?(await navigator.share({title:M,text:X}),je("Statement shared successfully!")):(await navigator.clipboard.writeText(X),je("Statement details copied to clipboard!"))}catch(v){if(v.name!=="AbortError")try{const f=r=>r?new Date(r).toLocaleDateString():"",S=r=>`$${(r==null?void 0:r.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}))||"0.00"}`,w=((k=s.period)==null?void 0:k.startDate)||s.startDate,M=((L=s.period)==null?void 0:L.endDate)||s.endDate,O=`${s.title||`P&L Statement - ${f(w)} to ${f(M)}`}

Period: ${f(w)} to ${f(M)}
Total Revenue: ${S(((y=(A=s.revenue)==null?void 0:A.totalRevenue)==null?void 0:y.amount)||0)}
Gross Profit: ${S(((P=s.grossProfit)==null?void 0:P.amount)||0)}
Net Profit: ${S(((G=s.netProfit)==null?void 0:G.amount)||0)}

Generated on ${f(new Date)}`;await navigator.clipboard.writeText(O),je("Statement details copied to clipboard!")}catch{Re("Failed to share statement. Please try exporting instead.")}}}})})]})}),e.jsx(Ts,{isOpen:x,onClose:()=>{i(!1),p(null)},onUpdate:Ge,statement:c}),e.jsx(Cs,{isOpen:d,onClose:()=>{D(!1),p(null)},onExport:Me,statement:c})]})})};export{Ys as PLStatements,Ys as default};
