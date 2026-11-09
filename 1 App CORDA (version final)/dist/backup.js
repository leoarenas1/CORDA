// Respaldo de la academia (lado del coach).
// El plan gratuito de Supabase no hace copias de seguridad automáticas, así que un coach aprobado puede descargar un archivo
// .json con los datos de su academia desde su perfil. No usa claves especiales: lee con la sesión del coach, y las reglas de la base
// de datos (RLS) deciden qué ve (no incluye los datos privados de otros coaches). No incluye fotos ni comprobantes ni contraseñas.
// El archivo trae correos y datos personales: se guarda en un lugar seguro. Se guarda en este dispositivo la fecha del último respaldo.
const BACKUP_PAGE=1000;
async function backupFetchAll(table,columns,orders){
  const rows=[];
  for(let from=0;;from+=BACKUP_PAGE){
    let query=cloud.from(table).select(columns);
    for(const column of orders)query=query.order(column);
    const {data,error}=await query.range(from,from+BACKUP_PAGE-1);
    if(error)throw error;
    rows.push(...data);
    if(data.length<BACKUP_PAGE)break;
  }
  return rows;
}
function backupStamp(){
  if(!state.backupAt)return 'Todavía no has descargado ningún respaldo en este dispositivo.';
  return 'Último respaldo en este dispositivo: '+new Date(state.backupAt).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})+'.';
}
async function downloadBackup(){
  if(role!=='Coach'||!cloud||(typeof phoneDemo!=='undefined'&&phoneDemo))return;
  const button=$('#backup-download');
  if(button)button.disabled=true;
  try{
    const {data:session}=await cloud.auth.getSession();
    if(!session.session){toast('Inicia sesión con tu cuenta de coach para descargar el respaldo.');return}
    const [profiles,items]=await Promise.all([
      backupFetchAll('profiles','id,email,name,role,approved,details,created_at',['created_at','id']),
      backupFetchAll('items','academy_id,member_id,kind,key,data,author,updated_by,updated_at',['member_id','kind','key'])
    ]);
    // Un coach sin aprobar no ve ni su academia: el archivo saldría casi vacío.
    if(profiles.length<2&&!items.length){toast('No hay datos que respaldar. Revisa que tu cuenta de coach esté aprobada.');return}
    const academy=actor()?.academy||state.profile?.academy||'academia';
    const now=new Date(),day=now.toISOString().slice(0,10);
    const file={
      app:'CORDA',tipo:'respaldo de academia',formato:1,fecha:now.toISOString(),academia:academy,
      conteo:{perfiles:profiles.length,datos:items.length},
      nota:'Incluye los perfiles (con correo) y los datos de la academia que esta cuenta de coach puede ver. No incluye fotos, comprobantes ni contraseñas, ni los datos privados de otros coaches. Contiene datos personales: guárdalo en un lugar seguro.',
      perfiles:profiles,datos:items
    };
    const slug=academy.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'academia';
    const link=document.createElement('a');
    link.href=URL.createObjectURL(new Blob([JSON.stringify(file,null,2)],{type:'application/json'}));
    link.download='CORDA-respaldo-'+slug+'-'+day+'.json';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(link.href),60000);
    state.backupAt=Date.now();save();
    toast('Respaldo descargado: '+profiles.length+' perfiles y '+items.length+' datos.');
    const hint=$('#backup-stamp');if(hint)hint.textContent=backupStamp();
  }catch{
    toast('No se pudo descargar el respaldo. Revisa tu conexión e inténtalo de nuevo.');
  }finally{
    if(button)button.disabled=false;
  }
}
document.addEventListener('click',event=>{if(event.target.closest?.('#backup-download'))downloadBackup()});
