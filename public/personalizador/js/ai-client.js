/* Credentials remain in this tab's memory. Never saved to browser storage. */
(() => {
  let key = '';
  let configured = false;
  const $ = s => document.querySelector(s);
  async function request(path, body) {
    const headers = {'Content-Type':'application/json'};
    if (key) headers['X-OpenRouter-Key'] = key;
    let response;
    try { response = await fetch('/api/personalizador/' + path,{method:'POST',headers,body:JSON.stringify(body)}); }
    catch { throw new Error('Não foi possível acessar a conexão de IA. Confira sua internet e tente novamente.'); }
    if (!response.ok) {
      let data; try { data = await response.json(); } catch {}
      throw new Error(data?.error || 'O servidor não concluiu o pedido. Tente novamente.');
    }
    return response;
  }
  function status() {
    $('#ai-status').textContent = configured || key ? 'Conversa → revisão → aprovação → prévia' : 'Conecte a OpenRouter para começar';
    $('#preview-status').textContent = configured || key ? 'OpenRouter · GPT Image 2.5' : 'IA aguardando conexão';
    $('#connect-ai').textContent = key ? 'Desconectar IA' : 'Conectar OpenRouter';
    $('#connect-ai').hidden = configured;
  }
  const ready = fetch('/api/personalizador/config').then(r=>r.ok?r.json():{}).then(data=>{configured=!!data.configured;status();}).catch(status);
  const dialog = $('#connection-dialog');
  let previousFocus;
  function open() { previousFocus=document.activeElement;dialog.showModal();$('#router-key').focus(); }
  function close() { $('#router-key').value='';dialog.close();previousFocus?.focus(); }
  $('#connect-ai').addEventListener('click',()=>{if(key){key='';status();document.dispatchEvent(new Event('meranno:connection'));}else open();});
  $('#connection-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>{$('#router-key').value='';});
  $('#connection-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=$('#connection-submit');button.disabled=true;
    $('#connection-error').textContent='Verificando conexão…';
    const candidate=$('#router-key').value.trim();
    try {
      const response=await fetch('/api/personalizador/connect',{method:'POST',headers:{'Content-Type':'application/json','X-OpenRouter-Key':candidate},body:'{}'});
      const result=await response.json();if(!response.ok)throw new Error(result.error);
      key=candidate;$('#connection-error').textContent='';status();close();document.dispatchEvent(new Event('meranno:connection'));
    } catch(error){$('#connection-error').textContent=error.message || 'Não foi possível conectar.';}
    finally{button.disabled=false;}
  });
  window.MerannoAI = {
    ready,
    ensure(){if(configured||key)return true;open();return false;},
    async call(path,body){return (await request(path,body)).json();},
    async generate(body,onProgress){
      const response=await request('generate',body);
      const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='',result=null;
      while(true){
        const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});
        let boundary;
        while((boundary=buffer.indexOf('\n\n'))>=0){
          const event=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);
          for(const line of event.split('\n'))if(line.startsWith('data: ')){
            const data=JSON.parse(line.slice(6));
            if(data.type==='error')throw new Error(data.error);
            if(data.type==='progress')onProgress(data.message);
            if(data.type==='completed')result=data;
          }
        }
      }
      if(!result)throw new Error('A conexão foi interrompida antes de receber a arte. Confira o pedido na OpenRouter antes de tentar novamente.');
      return result;
    }
  };
})();
