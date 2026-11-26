"use client";
import { useState, useTransition } from "react";
import { revisarEstampa } from "./revisao-estampa-acoes";

export function RevisaoEstampa({id,status,revisao}:{id:string;status:string;revisao?:{automatica?:string;humana?:string;responsavel?:string;data?:string}}){
  const [checked,setChecked]=useState(false),[pending,start]=useTransition(),[error,setError]=useState("");
  return <div className="my-3 space-y-2 border-t border-[var(--line)] pt-3">
    <p><strong>Revisão humana: {revisao?.humana??"pendente"}</strong></p>
    <p className="text-[var(--muted)]">A verificação automática não libera a produção. Confira arte, marca, texto, direitos de uso, conteúdo e os dois mockups.</p>
    {revisao?.responsavel&&<p>Revisado por {revisao.responsavel}{revisao.data?" em "+new Date(revisao.data).toLocaleString("pt-BR"):""}.</p>}
    {status==="pedida"&&<>
      <label className="flex items-start gap-2"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} disabled={pending}/>Conferi manualmente os arquivos e a prévia final.</label>
      <div className="flex flex-wrap gap-3">{(["aprovada","recusada"] as const).map(decisao=><button type="button" key={decisao} className="underline underline-offset-4 disabled:opacity-40" disabled={!checked||pending} onClick={()=>start(async()=>{setError("");const result=await revisarEstampa(id,decisao);if(result.erro)setError(result.erro);else setChecked(false);})}>{decisao==="aprovada"?"Aprovar arte":"Recusar arte"}</button>)}</div>
    </>}
    {error&&<p role="alert">{error}</p>}
  </div>;
}
