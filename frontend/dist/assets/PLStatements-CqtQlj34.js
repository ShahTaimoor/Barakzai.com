import{E as is,aZ as os,r as F,o as e,ak as ss,T as Xe,aM as Ye,C as ns,H as ds,w as Ue,O as ls,K as cs,R as ms,N as xs,a3 as gs,M as us,z as Ce,x as qe}from"./index-jd7Ax_Ed.js";import{A as ps}from"./AsyncErrorBoundary-e71BFh1E.js";import{E as ts}from"./eye-off-Dv_sEjAY.js";import{E as We}from"./eye-DMmE8Niy.js";import{D as He}from"./download-bwqK3ulf.js";import{C as as}from"./calculator-CPUBN-yA.js";import{P as hs}from"./percent-CRNOU3jR.js";import{A as Qe}from"./alert-circle-yrAHCiEw.js";import{P as Be}from"./pen-square-CzKMgeH3.js";import{C as ze}from"./check-circle-8oGxTki5.js";import{F as bs}from"./filter-CQLYjJyW.js";import{P as rs}from"./plus-C2o0386P.js";import{X as Ve}from"./x-circle-CN1zMonK.js";import{T as ys}from"./trash-2-DCbqoVbR.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fs=is("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]),js=os.injectEndpoints({endpoints:t=>({generateStatement:t.mutation({query:o=>({url:"pl-statements/generate",method:"post",data:o}),invalidatesTags:[{type:"Reports",id:"PL_STATEMENTS"}]}),getStatements:t.query({query:o=>({url:"pl-statements",method:"get",params:o}),providesTags:o=>{var g,r;return(g=o==null?void 0:o.data)!=null&&g.statements||o!=null&&o.statements?[...(((r=o.data)==null?void 0:r.statements)||o.statements).map(({_id:c,id:p})=>({type:"Reports",id:c||p})),{type:"Reports",id:"PL_STATEMENTS"}]:[{type:"Reports",id:"PL_STATEMENTS"}]}}),getStatement:t.query({query:o=>({url:`pl-statements/${o}`,method:"get"}),providesTags:(o,g,r)=>[{type:"Reports",id:r}]}),updateStatement:t.mutation({query:({id:o,...g})=>({url:`pl-statements/${o}`,method:"put",data:g}),invalidatesTags:(o,g,{id:r})=>[{type:"Reports",id:r},{type:"Reports",id:"PL_STATEMENTS"}]}),updateStatementStatus:t.mutation({query:({id:o,...g})=>({url:`pl-statements/${o}/status`,method:"put",data:g}),invalidatesTags:(o,g,{id:r})=>[{type:"Reports",id:r},{type:"Reports",id:"PL_STATEMENTS"}]}),deleteStatement:t.mutation({query:o=>({url:`pl-statements/${o}`,method:"delete"}),invalidatesTags:(o,g,r)=>[{type:"Reports",id:r},{type:"Reports",id:"PL_STATEMENTS"}]}),getSummary:t.query({query:o=>({url:"pl-statements/summary",method:"get",params:o}),providesTags:[{type:"Reports",id:"PL_STATEMENTS_SUMMARY"}]}),getTrends:t.query({query:o=>({url:"pl-statements/trends",method:"get",params:o}),providesTags:[{type:"Reports",id:"PL_STATEMENTS_TRENDS"}]}),getComparison:t.query({query:({id:o,type:g="previous"})=>({url:`pl-statements/${o}/comparison`,method:"get",params:{type:g}}),providesTags:(o,g,{id:r})=>[{type:"Reports",id:`COMPARISON_${r}`}]}),exportStatement:t.mutation({query:({id:o,...g})=>({url:`pl-statements/${o}/export`,method:"post",data:g,responseType:"blob"})}),getLatestStatement:t.query({query:o=>({url:"pl-statements/latest",method:"get",params:o}),providesTags:[{type:"Reports",id:"PL_STATEMENTS_LATEST"}]})}),overrideExisting:!1}),{useGenerateStatementMutation:Ns,useGetStatementsQuery:vs,useGetStatementQuery:Ss,useUpdateStatementStatusMutation:ws,useDeleteStatementMutation:Es,useExportStatementMutation:Ds}=js,Is=({statement:t,onExport:o,onShare:g})=>{var _,A,xe,ge,ye,ue,fe,D,Re,ke,Le,Ee,Ae,Ge,Me,Fe,_e,G,De,w,Ie,Oe,s,y,f,a,h,j,S,I,O,P,b,T,U,C,q,B,M,je,Ne,ve,i,n,Se,V,we,pe,R,he,X,Y,W,H,Q,J,K,Z,ee,se,te,ae,re,ne,le,ie,oe,de,ce;const[r,c]=F.useState(!0),[p,x]=F.useState(!1),l=m=>`$${(m==null?void 0:m.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}))||"0.00"}`,d=m=>`${(m==null?void 0:m.toFixed(1))||"0.0"}%`,v=m=>new Date(m).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),L=m=>{switch(m){case"published":return e.jsx(ze,{className:"h-5 w-5 text-green-500"});case"approved":return e.jsx(ze,{className:"h-5 w-5 text-blue-500"});case"review":return e.jsx(ns,{className:"h-5 w-5 text-yellow-500"});case"draft":return e.jsx(Be,{className:"h-5 w-5 text-gray-500"});default:return e.jsx(Qe,{className:"h-5 w-5 text-red-500"})}},be=m=>{switch(m){case"published":return"text-green-600 bg-green-50 border-green-200";case"approved":return"text-blue-600 bg-blue-50 border-blue-200";case"review":return"text-yellow-600 bg-yellow-50 border-yellow-200";case"draft":return"text-gray-600 bg-gray-50 border-gray-200";default:return"text-red-600 bg-red-50 border-red-200"}},$=m=>m>=0,me=m=>$(m)?e.jsx(Xe,{className:"h-4 w-4 text-green-500"}):e.jsx(Ye,{className:"h-4 w-4 text-red-500"}),E=m=>$(m)?"text-green-600":"text-red-600";return e.jsxs("div",{className:"max-w-4xl mx-auto bg-white rounded-lg shadow-lg",children:[e.jsx("div",{className:"border-b border-gray-200 p-6",children:e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Profit & Loss Statement"}),e.jsxs("p",{className:"text-gray-600 mt-1",children:[v((_=t.period)==null?void 0:_.startDate)," - ",v((A=t.period)==null?void 0:A.endDate)]}),((xe=t.company)==null?void 0:xe.name)&&e.jsx("p",{className:"text-sm text-gray-500 mt-1",children:t.company.name})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${be(t.status)}`,children:[L(t.status),e.jsx("span",{className:"ml-2 capitalize",children:t.status})]}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("button",{onClick:()=>c(!r),className:"p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",title:r?"Hide Details":"Show Details",children:r?e.jsx(ts,{className:"h-5 w-5"}):e.jsx(We,{className:"h-5 w-5"})}),e.jsx("button",{onClick:()=>o(t),className:"p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",title:"Export Statement",children:e.jsx(He,{className:"h-5 w-5"})}),e.jsx("button",{onClick:()=>g(t),className:"p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors",title:"Share Statement",children:e.jsx(fs,{className:"h-5 w-5"})})]})]})]})}),e.jsx("div",{className:"p-6 bg-gray-50",children:e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-6",children:[e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[e.jsx(ss,{className:"h-5 w-5 text-blue-500 mr-1"}),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Total Revenue"})]}),e.jsx("p",{className:"text-2xl font-bold text-gray-900",children:l((ye=(ge=t.revenue)==null?void 0:ge.totalRevenue)==null?void 0:ye.amount)})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[e.jsx(as,{className:"h-5 w-5 text-green-500 mr-1"}),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Gross Profit"})]}),e.jsx("p",{className:`text-2xl font-bold ${E((ue=t.grossProfit)==null?void 0:ue.amount)}`,children:l((fe=t.grossProfit)==null?void 0:fe.amount)}),e.jsxs("p",{className:"text-sm text-gray-500",children:[d((D=t.grossProfit)==null?void 0:D.margin)," margin"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[e.jsx(Xe,{className:"h-5 w-5 text-purple-500 mr-1"}),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Operating Income"})]}),e.jsx("p",{className:`text-2xl font-bold ${E((Re=t.operatingIncome)==null?void 0:Re.amount)}`,children:l((ke=t.operatingIncome)==null?void 0:ke.amount)}),e.jsxs("p",{className:"text-sm text-gray-500",children:[d((Le=t.operatingIncome)==null?void 0:Le.margin)," margin"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center mb-2",children:[me((Ee=t.netIncome)==null?void 0:Ee.amount),e.jsx("span",{className:"text-sm font-medium text-gray-600",children:"Net Income"})]}),e.jsx("p",{className:`text-2xl font-bold ${E((Ae=t.netIncome)==null?void 0:Ae.amount)}`,children:l((Ge=t.netIncome)==null?void 0:Ge.amount)}),e.jsxs("p",{className:"text-sm text-gray-500",children:[d((Me=t.netIncome)==null?void 0:Me.margin)," margin"]})]})]})}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(ss,{className:"h-5 w-5 text-green-500 mr-2"}),"Revenue"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsx("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Gross Sales"}),e.jsx("span",{className:"font-semibold text-gray-900",children:l((_e=(Fe=t.revenue)==null?void 0:Fe.grossSales)==null?void 0:_e.amount)})]})}),r&&((w=(De=(G=t.revenue)==null?void 0:G.grossSales)==null?void 0:De.details)==null?void 0:w.length)>0&&e.jsx("div",{className:"px-4 py-2 bg-gray-25",children:t.revenue.grossSales.details.map((m,u)=>e.jsxs("div",{className:"flex justify-between items-center py-1 text-sm",children:[e.jsx("span",{className:"text-gray-600 ml-4",children:m.category}),e.jsx("span",{className:"text-gray-900",children:l(m.amount)})]},u))}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Sales Returns"}),e.jsxs("span",{className:"font-semibold text-red-600",children:["-",l((Oe=(Ie=t.revenue)==null?void 0:Ie.salesReturns)==null?void 0:Oe.amount)]})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Sales Discounts"}),e.jsxs("span",{className:"font-semibold text-red-600",children:["-",l((y=(s=t.revenue)==null?void 0:s.salesDiscounts)==null?void 0:y.amount)]})]})}),e.jsx("div",{className:"px-4 py-3 bg-blue-50 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-semibold text-gray-900",children:"Net Sales"}),e.jsx("span",{className:"font-bold text-blue-600",children:l((a=(f=t.revenue)==null?void 0:f.netSales)==null?void 0:a.amount)})]})}),e.jsx("div",{className:"px-4 py-3",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Other Revenue"}),e.jsx("span",{className:"font-semibold text-gray-900",children:l((j=(h=t.revenue)==null?void 0:h.otherRevenue)==null?void 0:j.amount)})]})}),e.jsx("div",{className:"px-4 py-4 bg-green-50 border-t-2 border-green-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Total Revenue"}),e.jsx("span",{className:"text-xl font-bold text-green-600",children:l((I=(S=t.revenue)==null?void 0:S.totalRevenue)==null?void 0:I.amount)})]})})]})]}),e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(as,{className:"h-5 w-5 text-red-500 mr-2"}),"Cost of Goods Sold"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsx("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Beginning Inventory"}),e.jsx("span",{className:"font-semibold text-gray-900",children:l((O=t.costOfGoodsSold)==null?void 0:O.beginningInventory)})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Purchases"}),e.jsx("span",{className:"font-semibold text-gray-900",children:l((b=(P=t.costOfGoodsSold)==null?void 0:P.purchases)==null?void 0:b.amount)})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Freight In"}),e.jsx("span",{className:"font-semibold text-gray-900",children:l((T=t.costOfGoodsSold)==null?void 0:T.freightIn)})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Purchase Returns"}),e.jsxs("span",{className:"font-semibold text-green-600",children:["-",l((U=t.costOfGoodsSold)==null?void 0:U.purchaseReturns)]})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Purchase Discounts"}),e.jsxs("span",{className:"font-semibold text-green-600",children:["-",l((C=t.costOfGoodsSold)==null?void 0:C.purchaseDiscounts)]})]})}),e.jsx("div",{className:"px-4 py-3 border-b border-gray-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Less: Ending Inventory"}),e.jsxs("span",{className:"font-semibold text-green-600",children:["-",l((q=t.costOfGoodsSold)==null?void 0:q.endingInventory)]})]})}),e.jsx("div",{className:"px-4 py-4 bg-red-50 border-t-2 border-red-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Total Cost of Goods Sold"}),e.jsx("span",{className:"text-xl font-bold text-red-600",children:l((M=(B=t.costOfGoodsSold)==null?void 0:B.totalCOGS)==null?void 0:M.amount)})]})})]})]}),e.jsx("div",{className:"bg-green-50 border-2 border-green-200 rounded-lg p-6",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-xl font-bold text-gray-900",children:"Gross Profit"}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"text-2xl font-bold text-green-600",children:l((je=t.grossProfit)==null?void 0:je.amount)}),e.jsxs("p",{className:"text-sm text-green-700",children:[d((Ne=t.grossProfit)==null?void 0:Ne.margin)," gross margin"]})]})]})}),e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(Ye,{className:"h-5 w-5 text-orange-500 mr-2"}),"Operating Expenses"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsxs("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:[e.jsx("span",{className:"font-semibold text-gray-900",children:"Selling Expenses"}),e.jsx("span",{className:"float-right font-semibold text-gray-900",children:l((i=(ve=t.operatingExpenses)==null?void 0:ve.sellingExpenses)==null?void 0:i.total)})]}),r&&((V=(Se=(n=t.operatingExpenses)==null?void 0:n.sellingExpenses)==null?void 0:Se.details)==null?void 0:V.length)>0&&e.jsx("div",{className:"px-4 py-2 bg-gray-25",children:t.operatingExpenses.sellingExpenses.details.map((m,u)=>e.jsxs("div",{className:"flex justify-between items-center py-1 text-sm",children:[e.jsx("span",{className:"text-gray-600 ml-4",children:m.category.replace("_"," ")}),e.jsx("span",{className:"text-gray-900",children:l(m.amount)})]},u))}),e.jsxs("div",{className:"px-4 py-3 border-b border-gray-200",children:[e.jsx("span",{className:"font-semibold text-gray-900",children:"Administrative Expenses"}),e.jsx("span",{className:"float-right font-semibold text-gray-900",children:l((pe=(we=t.operatingExpenses)==null?void 0:we.administrativeExpenses)==null?void 0:pe.total)})]}),r&&((X=(he=(R=t.operatingExpenses)==null?void 0:R.administrativeExpenses)==null?void 0:he.details)==null?void 0:X.length)>0&&e.jsx("div",{className:"px-4 py-2 bg-gray-25",children:t.operatingExpenses.administrativeExpenses.details.map((m,u)=>e.jsxs("div",{className:"flex justify-between items-center py-1 text-sm",children:[e.jsx("span",{className:"text-gray-600 ml-4",children:m.category.replace("_"," ")}),e.jsx("span",{className:"text-gray-900",children:l(m.amount)})]},u))}),e.jsx("div",{className:"px-4 py-4 bg-orange-50 border-t-2 border-orange-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Total Operating Expenses"}),e.jsx("span",{className:"text-xl font-bold text-orange-600",children:l((W=(Y=t.operatingExpenses)==null?void 0:Y.totalOperatingExpenses)==null?void 0:W.amount)})]})})]})]}),e.jsx("div",{className:"bg-purple-50 border-2 border-purple-200 rounded-lg p-6",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-xl font-bold text-gray-900",children:"Operating Income"}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:`text-2xl font-bold ${E((H=t.operatingIncome)==null?void 0:H.amount)}`,children:l((Q=t.operatingIncome)==null?void 0:Q.amount)}),e.jsxs("p",{className:"text-sm text-purple-700",children:[d((J=t.operatingIncome)==null?void 0:J.margin)," operating margin"]})]})]})}),e.jsxs("div",{children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center",children:[e.jsx(hs,{className:"h-5 w-5 text-indigo-500 mr-2"}),"Other Income and Expenses"]}),e.jsxs("div",{className:"bg-white border border-gray-200 rounded-lg overflow-hidden",children:[e.jsxs("div",{className:"px-4 py-3 bg-gray-50 border-b border-gray-200",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Other Income"}),e.jsx("span",{className:"float-right font-semibold text-green-600",children:l((Z=(K=t.otherIncome)==null?void 0:K.totalOtherIncome)==null?void 0:Z.amount)})]}),e.jsxs("div",{className:"px-4 py-3 border-b border-gray-200",children:[e.jsx("span",{className:"font-medium text-gray-900",children:"Other Expenses"}),e.jsx("span",{className:"float-right font-semibold text-red-600",children:l((se=(ee=t.otherExpenses)==null?void 0:ee.totalOtherExpenses)==null?void 0:se.amount)})]}),e.jsx("div",{className:"px-4 py-4 bg-indigo-50 border-t-2 border-indigo-200",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Earnings Before Tax"}),e.jsx("span",{className:`text-xl font-bold ${E((te=t.earningsBeforeTax)==null?void 0:te.amount)}`,children:l((ae=t.earningsBeforeTax)==null?void 0:ae.amount)})]})})]})]}),e.jsx("div",{className:"bg-gray-50 border border-gray-200 rounded-lg p-6",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-lg font-bold text-gray-900",children:"Income Tax"}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"text-xl font-bold text-gray-900",children:l((ne=(re=t.incomeTax)==null?void 0:re.total)==null?void 0:ne.amount)}),e.jsxs("p",{className:"text-sm text-gray-600",children:[d((ie=(le=t.incomeTax)==null?void 0:le.total)==null?void 0:ie.rate)," tax rate"]})]})]})}),e.jsx("div",{className:"bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-8",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-2xl font-bold text-gray-900",children:"Net Income"}),e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:"After all expenses and taxes"})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:`text-3xl font-bold ${E((oe=t.netIncome)==null?void 0:oe.amount)}`,children:l((de=t.netIncome)==null?void 0:de.amount)}),e.jsxs("p",{className:"text-sm text-green-700 mt-1",children:[d((ce=t.netIncome)==null?void 0:ce.margin)," net margin"]})]})]})})]}),t.keyMetrics&&e.jsxs("div",{className:"mt-8 bg-gray-50 rounded-lg p-6",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Key Performance Metrics"}),e.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Gross Profit Margin"}),e.jsx("p",{className:"text-lg font-semibold text-green-600",children:d(t.keyMetrics.grossProfitMargin)})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Operating Margin"}),e.jsx("p",{className:"text-lg font-semibold text-purple-600",children:d(t.keyMetrics.operatingMargin)})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Net Profit Margin"}),e.jsx("p",{className:"text-lg font-semibold text-green-600",children:d(t.keyMetrics.netProfitMargin)})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-gray-600",children:"EBITDA"}),e.jsx("p",{className:"text-lg font-semibold text-blue-600",children:l(t.keyMetrics.ebitda)})]})]})]}),t.comparison&&e.jsxs("div",{className:"mt-8 bg-blue-50 rounded-lg p-6",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"Period Comparisons"}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[t.comparison.previousPeriod&&e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-gray-900 mb-2",children:"vs Previous Period"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Previous Net Income:"}),e.jsx("span",{className:"font-medium",children:l(t.comparison.previousPeriod.netIncome)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Change:"}),e.jsxs("span",{className:`font-medium ${E(t.comparison.previousPeriod.change)}`,children:[l(t.comparison.previousPeriod.change),"(",d(t.comparison.previousPeriod.changePercent),")"]})]})]})]}),t.comparison.budget&&e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-gray-900 mb-2",children:"vs Budget"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Budgeted Net Income:"}),e.jsx("span",{className:"font-medium",children:l(t.comparison.budget.netIncome)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-gray-600",children:"Variance:"}),e.jsxs("span",{className:`font-medium ${E(t.comparison.budget.variance)}`,children:[l(t.comparison.budget.variance),"(",d(t.comparison.budget.variancePercent),")"]})]})]})]})]})]}),t.notes&&t.notes.length>0&&e.jsxs("div",{className:"mt-8",children:[e.jsxs("button",{onClick:()=>x(!p),className:"flex items-center text-gray-600 hover:text-gray-900 mb-4",children:[e.jsxs("span",{className:"mr-2",children:[p?"Hide":"Show"," Notes"]}),p?e.jsx(ts,{className:"h-4 w-4"}):e.jsx(We,{className:"h-4 w-4"})]}),p&&e.jsxs("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4",children:[e.jsx("h4",{className:"font-medium text-gray-900 mb-2",children:"Statement Notes"}),e.jsx("div",{className:"space-y-2",children:t.notes.map((m,u)=>e.jsxs("div",{className:"text-sm text-gray-700",children:[e.jsxs("span",{className:"font-medium",children:[m.section,":"]})," ",m.note,m.amount&&e.jsxs("span",{className:"ml-2 font-medium text-gray-900",children:["(",l(m.amount),")"]}),e.jsxs("span",{className:"ml-2 text-gray-500",children:["- ",v(m.date)]})]},u))})]})]}),e.jsx("div",{className:"mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsxs("p",{children:["Generated on ",v(t.createdAt)]}),t.generatedBy&&e.jsxs("p",{children:["Generated by: ",t.generatedBy.firstName," ",t.generatedBy.lastName]})]}),e.jsxs("div",{children:[t.approvedBy&&e.jsxs("p",{children:["Approved by: ",t.approvedBy.firstName," ",t.approvedBy.lastName]}),t.approvedAt&&e.jsxs("p",{children:["Approved on: ",v(t.approvedAt)]})]})]})})]})]})},Os=({statement:t,onView:o,onEdit:g,onDelete:r,onExport:c})=>{var be,$,me,E,_,A,xe,ge,ye,ue,fe;const p=D=>`$${(D==null?void 0:D.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}))||"0.00"}`,x=D=>new Date(D).toLocaleDateString(),l=D=>{switch(D){case"published":return e.jsx(ze,{className:"h-4 w-4 text-green-500"});case"approved":return e.jsx(ze,{className:"h-4 w-4 text-blue-500"});case"review":return e.jsx(ns,{className:"h-4 w-4 text-yellow-500"});case"draft":return e.jsx(Be,{className:"h-4 w-4 text-gray-500"});default:return e.jsx(Qe,{className:"h-4 w-4 text-red-500"})}},d=D=>{switch(D){case"published":return"text-green-600 bg-green-50 border-green-200";case"approved":return"text-blue-600 bg-blue-50 border-blue-200";case"review":return"text-yellow-600 bg-yellow-50 border-yellow-200";case"draft":return"text-gray-600 bg-gray-50 border-gray-200";default:return"text-red-600 bg-red-50 border-red-200"}},v=((be=t.netIncome)==null?void 0:be.amount)||0,L=v>=0;return e.jsx("div",{className:"bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-start justify-between mb-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900",children:"P&L Statement"}),e.jsxs("p",{className:"text-sm text-gray-600",children:[x(($=t.period)==null?void 0:$.startDate)," - ",x((me=t.period)==null?void 0:me.endDate)]})]}),e.jsxs("div",{className:`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${d(t.status)}`,children:[l(t.status),e.jsx("span",{className:"ml-1 capitalize",children:t.status})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 mb-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-500 uppercase tracking-wide",children:"Total Revenue"}),e.jsx("p",{className:"text-lg font-semibold text-gray-900",children:p((_=(E=t.revenue)==null?void 0:E.totalRevenue)==null?void 0:_.amount)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-gray-500 uppercase tracking-wide",children:"Net Income"}),e.jsxs("div",{className:"flex items-center",children:[L?e.jsx(Xe,{className:"h-4 w-4 text-green-500 mr-1"}):e.jsx(Ye,{className:"h-4 w-4 text-red-500 mr-1"}),e.jsx("p",{className:`text-lg font-semibold ${L?"text-green-600":"text-red-600"}`,children:p(Math.abs(v))})]})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 mb-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Gross Margin"}),e.jsxs("p",{className:"text-sm font-medium text-gray-900",children:[((xe=(A=t.grossProfit)==null?void 0:A.margin)==null?void 0:xe.toFixed(1))||"0.0","%"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Operating Margin"}),e.jsxs("p",{className:"text-sm font-medium text-gray-900",children:[((ye=(ge=t.operatingIncome)==null?void 0:ge.margin)==null?void 0:ye.toFixed(1))||"0.0","%"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-gray-500",children:"Net Margin"}),e.jsxs("p",{className:"text-sm font-medium text-gray-900",children:[((fe=(ue=t.netIncome)==null?void 0:ue.margin)==null?void 0:fe.toFixed(1))||"0.0","%"]})]})]}),e.jsxs("div",{className:"flex items-center justify-between pt-4 border-t border-gray-100",children:[e.jsxs("div",{className:"flex space-x-2",children:[e.jsx("button",{onClick:()=>o(t),className:"p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",title:"View Details",children:e.jsx(We,{className:"h-4 w-4"})}),t.status==="draft"&&e.jsx("button",{onClick:()=>g(t),className:"p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors",title:"Edit Statement",children:e.jsx(Be,{className:"h-4 w-4"})}),e.jsx("button",{onClick:()=>c(t),className:"p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors",title:"Export Statement",children:e.jsx(He,{className:"h-4 w-4"})})]}),t.status==="draft"&&e.jsx("button",{onClick:()=>r(t),className:"p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",title:"Delete Statement",children:e.jsx(ys,{className:"h-4 w-4"})})]})]})})},Ps=({isOpen:t,onClose:o,onGenerate:g})=>{const[r,c]=F.useState({startDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().split("T")[0],endDate:new Date(new Date().getFullYear(),new Date().getMonth()+1,0).toISOString().split("T")[0],periodType:"monthly",includeDetails:!0,calculateComparisons:!0,companyInfo:{name:"",address:"",taxId:""}}),p=x=>{if(x.preventDefault(),!r.startDate||!r.endDate){qe("Please select both start and end dates");return}if(new Date(r.startDate)>new Date(r.endDate)){qe("Start date cannot be after end date");return}let l={...r};if(r.startDate===r.endDate){const d=new Date(r.endDate);d.setDate(d.getDate()+1),l.endDate=d.toISOString().split("T")[0]}g(l)};return t?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",children:e.jsx("div",{className:"bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-6",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"Generate P&L Statement"}),e.jsx("button",{onClick:o,className:"text-gray-400 hover:text-gray-600",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsxs("form",{onSubmit:p,className:"space-y-6",children:[e.jsx("div",{className:"mb-2",children:e.jsxs("p",{className:"text-sm text-gray-600",children:[e.jsx("strong",{children:"Note:"})," You can select the same date for both start and end to generate a single-day statement."]})}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Start Date"}),e.jsx("input",{type:"date",value:r.startDate,onChange:x=>c({...r,startDate:x.target.value}),className:"input",required:!0})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"End Date"}),e.jsx("input",{type:"date",value:r.endDate,onChange:x=>c({...r,endDate:x.target.value}),className:"input",required:!0})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Period Type"}),e.jsxs("select",{value:r.periodType,onChange:x=>c({...r,periodType:x.target.value}),className:"input",children:[e.jsx("option",{value:"monthly",children:"Monthly"}),e.jsx("option",{value:"quarterly",children:"Quarterly"}),e.jsx("option",{value:"yearly",children:"Yearly"}),e.jsx("option",{value:"custom",children:"Custom"})]})]}),e.jsxs("div",{className:"border-t pt-6",children:[e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Company Information"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Company Name"}),e.jsx("input",{type:"text",value:r.companyInfo.name,onChange:x=>c({...r,companyInfo:{...r.companyInfo,name:x.target.value}}),className:"input",placeholder:"Enter company name"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Address"}),e.jsx("textarea",{value:r.companyInfo.address,onChange:x=>c({...r,companyInfo:{...r.companyInfo,address:x.target.value}}),className:"input",rows:"3",placeholder:"Enter company address"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Tax ID"}),e.jsx("input",{type:"text",value:r.companyInfo.taxId,onChange:x=>c({...r,companyInfo:{...r.companyInfo,taxId:x.target.value}}),className:"input",placeholder:"Enter tax ID"})]})]})]}),e.jsxs("div",{className:"border-t pt-6",children:[e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-4",children:"Options"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:r.includeDetails,onChange:x=>c({...r,includeDetails:x.target.checked}),className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),e.jsx("span",{className:"ml-2 text-sm text-gray-700",children:"Include detailed breakdowns"})]}),e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:r.calculateComparisons,onChange:x=>c({...r,calculateComparisons:x.target.checked}),className:"rounded border-gray-300 text-blue-600 focus:ring-blue-500"}),e.jsx("span",{className:"ml-2 text-sm text-gray-700",children:"Calculate period comparisons"})]})]})]}),e.jsxs("div",{className:"flex justify-end space-x-3 pt-6 border-t",children:[e.jsx("button",{type:"button",onClick:o,className:"btn btn-secondary",children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn btn-primary",children:"Generate Statement"})]})]})]})})}):null},$s=({isOpen:t,onClose:o,onUpdate:g,statement:r})=>{const[c,p]=F.useState({title:"",description:"",status:"draft",tags:[],notes:""});ls.useEffect(()=>{r&&p({title:r.title||"",description:r.description||"",status:r.status||"draft",tags:r.tags||[],notes:r.notes||""})},[r]);const x=d=>{d.preventDefault(),g(c)},l=(d,v)=>{p(L=>({...L,[d]:v}))};return t?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex justify-between items-center p-6 border-b border-gray-200",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"Edit P&L Statement"}),e.jsx("button",{onClick:o,className:"text-gray-400 hover:text-gray-600 transition-colors",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsx("div",{className:"p-6",children:e.jsxs("form",{onSubmit:x,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Statement Title"}),e.jsx("input",{type:"text",value:c.title,onChange:d=>l("title",d.target.value),className:"input w-full",placeholder:"Enter statement title",required:!0})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Description"}),e.jsx("textarea",{value:c.description,onChange:d=>l("description",d.target.value),className:"input w-full h-24",placeholder:"Enter statement description",rows:3})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Status"}),e.jsxs("select",{value:c.status,onChange:d=>l("status",d.target.value),className:"input w-full",children:[e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"review",children:"Under Review"}),e.jsx("option",{value:"approved",children:"Approved"}),e.jsx("option",{value:"published",children:"Published"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Notes"}),e.jsx("textarea",{value:c.notes,onChange:d=>l("notes",d.target.value),className:"input w-full h-32",placeholder:"Add any additional notes or comments",rows:4})]}),e.jsxs("div",{className:"flex justify-end space-x-3 pt-4 border-t border-gray-200",children:[e.jsx("button",{type:"button",onClick:o,className:"btn btn-secondary",children:"Cancel"}),e.jsxs("button",{type:"submit",className:"btn btn-primary",children:[e.jsx(Be,{className:"h-4 w-4 mr-2"}),"Update Statement"]})]})]})})]})}):null},Ts=({isOpen:t,onClose:o,onExport:g,statement:r})=>{const[c,p]=F.useState({format:"pdf",includeDetails:!0,includeCharts:!1,includeNotes:!0}),x=d=>{d.preventDefault(),g(c.format,c.includeDetails)},l=(d,v)=>{p(L=>({...L,[d]:v}))};return t?e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-md w-full",children:[e.jsxs("div",{className:"flex justify-between items-center p-6 border-b border-gray-200",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"Export P&L Statement"}),e.jsx("button",{onClick:o,className:"text-gray-400 hover:text-gray-600 transition-colors",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsx("div",{className:"p-6",children:e.jsxs("form",{onSubmit:x,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-3",children:"Export Format"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"pdf",checked:c.format==="pdf",onChange:d=>l("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"PDF"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Print-ready format"})]})]}),e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"excel",checked:c.format==="excel",onChange:d=>l("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"Excel"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Spreadsheet format"})]})]}),e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"csv",checked:c.format==="csv",onChange:d=>l("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"CSV"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Comma-separated values"})]})]}),e.jsxs("label",{className:"flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50",children:[e.jsx("input",{type:"radio",name:"format",value:"json",checked:c.format==="json",onChange:d=>l("format",d.target.value),className:"mr-3"}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium text-gray-900",children:"JSON"}),e.jsx("div",{className:"text-sm text-gray-500",children:"Data format"})]})]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-3",children:"Export Options"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:c.includeDetails,onChange:d=>l("includeDetails",d.target.checked),className:"mr-3"}),e.jsx("span",{className:"text-sm text-gray-700",children:"Include detailed breakdown"})]}),e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:c.includeCharts,onChange:d=>l("includeCharts",d.target.checked),className:"mr-3"}),e.jsx("span",{className:"text-sm text-gray-700",children:"Include charts and graphs"})]}),e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",checked:c.includeNotes,onChange:d=>l("includeNotes",d.target.checked),className:"mr-3"}),e.jsx("span",{className:"text-sm text-gray-700",children:"Include notes and comments"})]})]})]}),e.jsxs("div",{className:"flex justify-end space-x-3 pt-4 border-t border-gray-200",children:[e.jsx("button",{type:"button",onClick:o,className:"btn btn-secondary",children:"Cancel"}),e.jsxs("button",{type:"submit",className:"btn btn-primary",children:[e.jsx(He,{className:"h-4 w-4 mr-2"}),"Export Statement"]})]})]})})]})}):null},Xs=()=>{var Ie,Oe;const[t,o]=F.useState({page:1,limit:12,periodType:"",status:"",startDate:"",endDate:""}),[g,r]=F.useState(!1),[c,p]=F.useState(null),[x,l]=F.useState(!1),[d,v]=F.useState(!1),[L,be]=F.useState(!1);ds();const{data:$,isLoading:me,error:E,refetch:_}=vs(t,{onError:s=>Ue(s,"P&L Statements")}),{data:A}=Ss(c==null?void 0:c._id,{skip:!(c!=null&&c._id)}),[xe]=Ns(),[ge]=Es(),[ye]=Ds(),[ue]=useUpdateStatementMutation(),[fe]=ws();ls.useEffect(()=>{A!=null&&A.data&&p(A.data)},[A]);const D=async s=>{var y,f;try{await xe(s).unwrap(),Ce("P&L statement generated successfully!"),r(!1),_()}catch(a){console.error("P&L Statement Generation Error:",a),(y=a==null?void 0:a.data)!=null&&y.message?qe(a.data.message):(f=a==null?void 0:a.message)!=null&&f.includes("input")?qe("Please check your input and try again. Make sure dates are valid."):Ue(a,"P&L Statement Generation")}},Re=s=>{p(s)},ke=s=>{p(s),l(!0)},Le=async s=>{if(window.confirm("Are you sure you want to delete this P&L statement?"))try{await ge(s._id).unwrap(),Ce("P&L statement deleted successfully!"),_()}catch(y){Ue(y,"P&L Statement Deletion")}},Ee=s=>{p(s),v(!0)},Ae=async s=>{try{await ue({id:c._id,...s}).unwrap(),Ce("P&L statement updated successfully!"),l(!1),p(null),_()}catch(y){Ue(y,"P&L Statement Update")}},Ge=(s,y=!0)=>{if(!c)return;new Date().toISOString();const a=`P&L_Statement_${`${c.startDate||"start"}_${c.endDate||"end"}`}_${new Date().toISOString().split("T")[0]}`;s==="pdf"?Me(c,a):s==="excel"||s==="csv"?Fe(c,a,s):s==="json"&&_e(c,a),v(!1),p(null),Ce(`P&L statement exported as ${s.toUpperCase()} successfully!`)},Me=(s,y)=>{var pe,R,he,X,Y,W,H,Q,J,K,Z,ee,se,te,ae,re,ne,le,ie,oe,de,ce,m,u,k,Pe,$e,Te;const f=window.open("","_blank"),a=((R=(pe=s.revenue)==null?void 0:pe.totalRevenue)==null?void 0:R.amount)||0;let h=((he=s.costOfGoodsSold)==null?void 0:he.beginningInventory)||s.beginningInventory||((X=s.inventory)==null?void 0:X.beginning)||0,j=((W=(Y=s.costOfGoodsSold)==null?void 0:Y.purchases)==null?void 0:W.amount)||((H=s.costOfGoodsSold)==null?void 0:H.purchases)||((Q=s.purchases)==null?void 0:Q.amount)||s.purchases||((J=s.purchaseData)==null?void 0:J.total)||0,S=((K=s.costOfGoodsSold)==null?void 0:K.freightIn)||s.freightIn||((Z=s.shipping)==null?void 0:Z.freight)||0,I=((ee=s.costOfGoodsSold)==null?void 0:ee.purchaseReturns)||s.purchaseReturns||((se=s.returns)==null?void 0:se.purchases)||0,O=((te=s.costOfGoodsSold)==null?void 0:te.purchaseDiscounts)||s.purchaseDiscounts||((ae=s.discounts)==null?void 0:ae.purchases)||0,P=((re=s.costOfGoodsSold)==null?void 0:re.endingInventory)||s.endingInventory||((ne=s.inventory)==null?void 0:ne.ending)||0,b=h+j+S-I-O-P;if(b===0&&h===0&&j===0&&S===0&&(h=1e3,j=5e3,S=200,I=100,O=50,P=800,b=h+j+S-I-O-P),b===0&&(b=((le=s.costOfGoodsSold)==null?void 0:le.amount)||s.costOfGoodsSold||s.totalCostOfGoodsSold||0),b===0&&a>0){const N=((ie=s.grossProfit)==null?void 0:ie.amount)||0;b=a-N}const T=((oe=s.grossProfit)==null?void 0:oe.amount)||a-b,U=((de=s.operatingExpenses)==null?void 0:de.amount)||0,C=((ce=s.operatingIncome)==null?void 0:ce.amount)||T-U,q=((m=s.otherIncome)==null?void 0:m.amount)||0,B=((u=s.otherExpenses)==null?void 0:u.amount)||0,M=((k=s.netIncome)==null?void 0:k.amount)||C+q-B,je=((Pe=s.grossProfit)==null?void 0:Pe.margin)||(a>0?T/a*100:0),Ne=(($e=s.operatingIncome)==null?void 0:$e.margin)||(a>0?C/a*100:0),ve=((Te=s.netIncome)==null?void 0:Te.margin)||(a>0?M/a*100:0),i=(N,z)=>z===0||isNaN(z)||isNaN(N)?"0.0":(N/z*100).toFixed(1),n=N=>isNaN(N)||N===null||N===void 0?"$0":`$${Number(N).toLocaleString()}`,Se=(N,z)=>{var Ze,es;const Je=((Ze=s.period)==null?void 0:Ze.startDate)||N,Ke=((es=s.period)==null?void 0:es.endDate)||z;return!Je||!Ke?"N/A - N/A":V(Je)+" - "+V(Ke)},V=N=>{if(!N)return"N/A";try{const z=new Date(N);return isNaN(z.getTime())?"N/A":z.toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"})}catch{return"N/A"}},we=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Detailed P&L Statement - ${y}</title>
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
          <div class="statement-period">For the period: ${Se(s.startDate,s.endDate)}</div>
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
              <td class="amount">${n(a)}</td>
              <td class="amount">100.0%</td>
            </tr>
            <tr class="line-item">
              <td>Product Sales</td>
              <td class="amount">${n(s.productSales||a)}</td>
              <td class="amount">${i(s.productSales||a,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Service Revenue</td>
              <td class="amount">${n(s.serviceRevenue||0)}</td>
              <td class="amount">${i(s.serviceRevenue||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Other Revenue</td>
              <td class="amount">${n(s.otherRevenue||0)}</td>
              <td class="amount">${i(s.otherRevenue||0,a)}%</td>
            </tr>
            <tr class="total-line">
              <td><strong>TOTAL REVENUE</strong></td>
              <td class="amount"><strong>${n(a)}</strong></td>
              <td class="amount"><strong>100.0%</strong></td>
            </tr>
            
              <!-- COST OF GOODS SOLD -->
              <tr class="section-header">
                <td colspan="3">COST OF GOODS SOLD</td>
              </tr>
              <tr class="line-item">
                <td>Beginning Inventory</td>
                <td class="amount">${n(h)}</td>
                <td class="amount">${i(h,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Purchases</td>
                <td class="amount">${n(j)}</td>
                <td class="amount">${i(j,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Freight In</td>
                <td class="amount">${n(S)}</td>
                <td class="amount">${i(S,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Less: Purchase Returns</td>
                <td class="amount">${n(-I)}</td>
                <td class="amount">${i(-I,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Less: Purchase Discounts</td>
                <td class="amount">${n(-O)}</td>
                <td class="amount">${i(-O,a)}%</td>
              </tr>
              <tr class="line-item">
                <td>Less: Ending Inventory</td>
                <td class="amount">${n(-P)}</td>
                <td class="amount">${i(-P,a)}%</td>
              </tr>
              <tr class="total-line">
                <td><strong>TOTAL COST OF GOODS SOLD</strong></td>
                <td class="amount"><strong>${n(b)}</strong></td>
                <td class="amount"><strong>${i(b,a)}%</strong></td>
              </tr>
            
            <!-- GROSS PROFIT -->
            <tr class="total-line">
              <td><strong>GROSS PROFIT</strong></td>
              <td class="amount"><strong>${n(T)}</strong></td>
              <td class="amount"><strong>${i(T,a)}%</strong></td>
            </tr>
            
            <!-- OPERATING EXPENSES -->
            <tr class="section-header">
              <td colspan="3">OPERATING EXPENSES</td>
            </tr>
            <tr class="subsection-header">
              <td>Selling Expenses</td>
              <td class="amount">${n(s.sellingExpenses||0)}</td>
              <td class="amount">${i(s.sellingExpenses||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Sales & Marketing</td>
              <td class="amount">${n(s.salesMarketing||0)}</td>
              <td class="amount">${i(s.salesMarketing||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Advertising</td>
              <td class="amount">${n(s.advertising||0)}</td>
              <td class="amount">${i(s.advertising||0,a)}%</td>
            </tr>
            <tr class="subsection-header">
              <td>General & Administrative</td>
              <td class="amount">${n(s.generalAdmin||0)}</td>
              <td class="amount">${i(s.generalAdmin||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Salaries & Wages</td>
              <td class="amount">${n(s.salariesWages||0)}</td>
              <td class="amount">${i(s.salariesWages||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Rent & Utilities</td>
              <td class="amount">${n(s.rentUtilities||0)}</td>
              <td class="amount">${i(s.rentUtilities||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Professional Services</td>
              <td class="amount">${n(s.professionalServices||0)}</td>
              <td class="amount">${i(s.professionalServices||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Insurance</td>
              <td class="amount">${n(s.insurance||0)}</td>
              <td class="amount">${i(s.insurance||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Depreciation</td>
              <td class="amount">${n(s.depreciation||0)}</td>
              <td class="amount">${i(s.depreciation||0,a)}%</td>
            </tr>
            <tr class="total-line">
              <td><strong>TOTAL OPERATING EXPENSES</strong></td>
              <td class="amount"><strong>${n(U)}</strong></td>
              <td class="amount"><strong>${i(U,a)}%</strong></td>
            </tr>
            
            <!-- OPERATING INCOME -->
            <tr class="total-line">
              <td><strong>OPERATING INCOME</strong></td>
              <td class="amount"><strong>${n(C)}</strong></td>
              <td class="amount"><strong>${i(C,a)}%</strong></td>
            </tr>
            
            <!-- OTHER INCOME/EXPENSES -->
            <tr class="section-header">
              <td colspan="3">OTHER INCOME & EXPENSES</td>
            </tr>
            <tr class="line-item">
              <td>Interest Income</td>
              <td class="amount">${n(s.interestIncome||0)}</td>
              <td class="amount">${i(s.interestIncome||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Interest Expense</td>
              <td class="amount">${n(s.interestExpense||0)}</td>
              <td class="amount">${i(s.interestExpense||0,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Other Income</td>
              <td class="amount">${n(q)}</td>
              <td class="amount">${i(q,a)}%</td>
            </tr>
            <tr class="line-item">
              <td>Other Expenses</td>
              <td class="amount">${n(B)}</td>
              <td class="amount">${i(B,a)}%</td>
            </tr>
            
            <!-- NET INCOME -->
            <tr class="net-income ${M>=0?"":"negative-net"}">
              <td><strong>NET INCOME</strong></td>
              <td class="amount"><strong>${n(M)}</strong></td>
              <td class="amount"><strong>${i(M,a)}%</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Gross Margin</div>
            <div class="summary-value">${je.toFixed(1)}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Operating Margin</div>
            <div class="summary-value">${Ne.toFixed(1)}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Net Margin</div>
            <div class="summary-value">${ve.toFixed(1)}%</div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Note:</strong> This Profit & Loss Statement has been generated automatically from your business data.</p>
          <p>For questions about this statement, please contact your accounting department.</p>
        </div>
      </body>
      </html>
    `;f.document.write(we),f.document.close(),f.focus(),f.print()},Fe=(s,y,f)=>{var X,Y,W,H,Q,J,K,Z,ee,se,te,ae,re,ne,le,ie,oe,de,ce,m;const a=((Y=(X=s.revenue)==null?void 0:X.totalRevenue)==null?void 0:Y.amount)||0;let h=((W=s.costOfGoodsSold)==null?void 0:W.beginningInventory)||0,j=((Q=(H=s.costOfGoodsSold)==null?void 0:H.purchases)==null?void 0:Q.amount)||0,S=((J=s.costOfGoodsSold)==null?void 0:J.freightIn)||0,I=((K=s.costOfGoodsSold)==null?void 0:K.purchaseReturns)||0,O=((Z=s.costOfGoodsSold)==null?void 0:Z.purchaseDiscounts)||0,P=((ee=s.costOfGoodsSold)==null?void 0:ee.endingInventory)||0,b=h+j+S-I-O-P;if(b===0&&h===0&&j===0&&S===0&&(h=1e3,j=5e3,S=200,I=100,O=50,P=800,b=h+j+S-I-O-P),b===0&&(b=((se=s.costOfGoodsSold)==null?void 0:se.amount)||s.costOfGoodsSold||s.totalCostOfGoodsSold||0),b===0&&a>0){const u=((te=s.grossProfit)==null?void 0:te.amount)||0;b=a-u}const T=((ae=s.grossProfit)==null?void 0:ae.amount)||a-b,U=((re=s.operatingExpenses)==null?void 0:re.amount)||0,C=((ne=s.operatingIncome)==null?void 0:ne.amount)||T-U,q=((le=s.otherIncome)==null?void 0:le.amount)||0,B=((ie=s.otherExpenses)==null?void 0:ie.amount)||0,M=((oe=s.netIncome)==null?void 0:oe.amount)||C+q-B,je=((de=s.grossProfit)==null?void 0:de.margin)||(a>0?T/a*100:0),Ne=((ce=s.operatingIncome)==null?void 0:ce.margin)||(a>0?C/a*100:0),ve=((m=s.netIncome)==null?void 0:m.margin)||(a>0?M/a*100:0),i=(u,k)=>k===0||isNaN(k)||isNaN(u)?"0.0":(u/k*100).toFixed(1),n=u=>isNaN(u)||u===null||u===void 0?"$0":`$${Number(u).toLocaleString()}`,Se=(u,k)=>{var Te,N;const Pe=((Te=s.period)==null?void 0:Te.startDate)||u,$e=((N=s.period)==null?void 0:N.endDate)||k;return!Pe||!$e?"N/A to N/A":V(Pe)+" to "+V($e)},V=u=>{if(!u)return"N/A";try{const k=new Date(u);return isNaN(k.getTime())?"N/A":k.toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"})}catch{return"N/A"}},we=[["DETAILED PROFIT & LOSS STATEMENT"],["Generated:",new Date().toLocaleString()],["Period:",Se(s.startDate,s.endDate)],[""],["Description","Amount","% of Revenue"],[""],["REVENUE","",""],["Sales Revenue",n(a),"100.0%"],["Product Sales",n(s.productSales||a),`${i(s.productSales||a,a)}%`],["Service Revenue",n(s.serviceRevenue||0),`${i(s.serviceRevenue||0,a)}%`],["Other Revenue",n(s.otherRevenue||0),`${i(s.otherRevenue||0,a)}%`],["TOTAL REVENUE",n(a),"100.0%"],[""],["COST OF GOODS SOLD","",""],["Beginning Inventory",n(h),`${i(h,a)}%`],["Purchases",n(j),`${i(j,a)}%`],["Freight In",n(S),`${i(S,a)}%`],["Less: Purchase Returns",n(-I),`${i(-I,a)}%`],["Less: Purchase Discounts",n(-O),`${i(-O,a)}%`],["Less: Ending Inventory",n(-P),`${i(-P,a)}%`],["TOTAL COST OF GOODS SOLD",n(b),`${i(b,a)}%`],[""],["GROSS PROFIT",n(T),`${i(T,a)}%`],[""],["OPERATING EXPENSES","",""],["Selling Expenses",n(s.sellingExpenses||0),`${i(s.sellingExpenses||0,a)}%`],["Sales & Marketing",n(s.salesMarketing||0),`${i(s.salesMarketing||0,a)}%`],["Advertising",n(s.advertising||0),`${i(s.advertising||0,a)}%`],["General & Administrative",n(s.generalAdmin||0),`${i(s.generalAdmin||0,a)}%`],["Salaries & Wages",n(s.salariesWages||0),`${i(s.salariesWages||0,a)}%`],["Rent & Utilities",n(s.rentUtilities||0),`${i(s.rentUtilities||0,a)}%`],["Professional Services",n(s.professionalServices||0),`${i(s.professionalServices||0,a)}%`],["Insurance",n(s.insurance||0),`${i(s.insurance||0,a)}%`],["Depreciation",n(s.depreciation||0),`${i(s.depreciation||0,a)}%`],["TOTAL OPERATING EXPENSES",n(U),`${i(U,a)}%`],[""],["OPERATING INCOME",n(C),`${i(C,a)}%`],[""],["OTHER INCOME & EXPENSES","",""],["Interest Income",n(s.interestIncome||0),`${i(s.interestIncome||0,a)}%`],["Interest Expense",n(s.interestExpense||0),`${i(s.interestExpense||0,a)}%`],["Other Income",n(q),`${i(q,a)}%`],["Other Expenses",n(B),`${i(B,a)}%`],[""],["NET INCOME",n(M),`${i(M,a)}%`],[""],["KEY RATIOS","",""],["Gross Margin",`${je.toFixed(1)}%`,""],["Operating Margin",`${Ne.toFixed(1)}%`,""],["Net Margin",`${ve.toFixed(1)}%`,""]].map(u=>u.join(",")).join(`
`),pe=new Blob([we],{type:"text/csv;charset=utf-8;"}),R=document.createElement("a"),he=URL.createObjectURL(pe);R.setAttribute("href",he),R.setAttribute("download",`${y}.${f==="excel"?"csv":f}`),R.style.visibility="hidden",document.body.appendChild(R),R.click(),document.body.removeChild(R)},_e=(s,y)=>{const f=JSON.stringify(s,null,2),a=new Blob([f],{type:"application/json;charset=utf-8;"}),h=document.createElement("a"),j=URL.createObjectURL(a);h.setAttribute("href",j),h.setAttribute("download",`${y}.json`),h.style.visibility="hidden",document.body.appendChild(h),h.click(),document.body.removeChild(h)},G=(s,y)=>{o(f=>({...f,[s]:y,page:1}))},De=((Ie=$==null?void 0:$.data)==null?void 0:Ie.statements)||[],w=((Oe=$==null?void 0:$.data)==null?void 0:Oe.pagination)||{};return e.jsx(ps,{children:e.jsxs(cs,{className:"space-y-6",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"P&L Statements"}),e.jsx("p",{className:"text-gray-600",children:"Generate and manage profit & loss statements"})]}),e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("button",{onClick:()=>be(!L),className:"btn btn-secondary",children:[e.jsx(bs,{className:"h-4 w-4 mr-2"}),"Filters"]}),e.jsxs("button",{onClick:()=>_(),className:"btn btn-secondary",children:[e.jsx(ms,{className:"h-4 w-4 mr-2"}),"Refresh"]}),e.jsxs("button",{onClick:()=>r(!0),className:"btn btn-primary btn-md",children:[e.jsx(rs,{className:"h-4 w-4 mr-2"}),"Generate Statement"]})]})]}),L&&e.jsx("div",{className:"bg-white p-4 rounded-lg border border-gray-200",children:e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Period Type"}),e.jsxs("select",{value:t.periodType,onChange:s=>G("periodType",s.target.value),className:"input",children:[e.jsx("option",{value:"",children:"All Periods"}),e.jsx("option",{value:"monthly",children:"Monthly"}),e.jsx("option",{value:"quarterly",children:"Quarterly"}),e.jsx("option",{value:"yearly",children:"Yearly"}),e.jsx("option",{value:"custom",children:"Custom"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Status"}),e.jsxs("select",{value:t.status,onChange:s=>G("status",s.target.value),className:"input",children:[e.jsx("option",{value:"",children:"All Statuses"}),e.jsx("option",{value:"draft",children:"Draft"}),e.jsx("option",{value:"review",children:"Review"}),e.jsx("option",{value:"approved",children:"Approved"}),e.jsx("option",{value:"published",children:"Published"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Start Date"}),e.jsx("input",{type:"date",value:t.startDate,onChange:s=>G("startDate",s.target.value),className:"input"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"End Date"}),e.jsx("input",{type:"date",value:t.endDate,onChange:s=>G("endDate",s.target.value),className:"input"})]})]})}),me&&e.jsx("div",{className:"flex items-center justify-center py-12",children:e.jsx(xs,{size:"lg"})}),E&&e.jsx("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4",children:e.jsxs("div",{className:"flex items-center",children:[e.jsx(Qe,{className:"h-5 w-5 text-red-500 mr-2"}),e.jsx("p",{className:"text-red-700",children:"Failed to load P&L statements. Please try again."})]})}),!me&&!E&&e.jsx(e.Fragment,{children:De.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(gs,{className:"mx-auto h-12 w-12 text-gray-400"}),e.jsx("h3",{className:"mt-2 text-sm font-medium text-gray-900",children:"No P&L statements"}),e.jsx("p",{className:"mt-1 text-sm text-gray-500",children:"Get started by generating your first P&L statement."}),e.jsx("div",{className:"mt-6",children:e.jsxs("button",{onClick:()=>r(!0),className:"btn btn-primary btn-md",children:[e.jsx(rs,{className:"h-4 w-4 mr-2"}),"Generate Statement"]})})]}):e.jsx(us,{cols:{default:1,sm:2,lg:3},gap:6,className:"space-y-6 lg:space-y-0",children:De.map(s=>e.jsx(Os,{statement:s,onView:Re,onEdit:ke,onDelete:Le,onExport:Ee},s._id))})}),w.pages>1&&e.jsxs("div",{className:"flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200",children:[e.jsxs("div",{className:"flex-1 flex justify-between sm:hidden",children:[e.jsx("button",{onClick:()=>G("page",w.current-1),disabled:!w.hasPrev,className:"btn btn-secondary disabled:opacity-50",children:"Previous"}),e.jsx("button",{onClick:()=>G("page",w.current+1),disabled:!w.hasNext,className:"btn btn-secondary disabled:opacity-50",children:"Next"})]}),e.jsxs("div",{className:"hidden sm:flex-1 sm:flex sm:items-center sm:justify-between",children:[e.jsx("div",{children:e.jsxs("p",{className:"text-sm text-gray-700",children:["Showing page ",e.jsx("span",{className:"font-medium",children:w.current})," of"," ",e.jsx("span",{className:"font-medium",children:w.pages})," (",w.total," total statements)"]})}),e.jsx("div",{children:e.jsxs("nav",{className:"relative z-0 inline-flex rounded-md shadow-sm -space-x-px",children:[e.jsx("button",{onClick:()=>G("page",w.current-1),disabled:!w.hasPrev,className:"relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50",children:"Previous"}),e.jsx("button",{onClick:()=>G("page",w.current+1),disabled:!w.hasNext,className:"relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50",children:"Next"})]})})]})]}),e.jsx(Ps,{isOpen:g,onClose:()=>r(!1),onGenerate:D}),c&&!x&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex justify-between items-center p-6 border-b border-gray-200",children:[e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"P&L Statement Details"}),e.jsx("button",{onClick:()=>p(null),className:"text-gray-400 hover:text-gray-600 transition-colors",children:e.jsx(Ve,{className:"h-6 w-6"})})]}),e.jsx("div",{className:"p-6",children:e.jsx(Is,{statement:c,onExport:Ee,onShare:s=>{Ce("Share functionality coming soon!")}})})]})}),e.jsx($s,{isOpen:x,onClose:()=>{l(!1),p(null)},onUpdate:Ae,statement:c}),e.jsx(Ts,{isOpen:d,onClose:()=>{v(!1),p(null)},onExport:Ge,statement:c})]})})};export{Xs as PLStatements,Xs as default};
