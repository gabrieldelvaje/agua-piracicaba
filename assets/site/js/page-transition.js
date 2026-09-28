(() => {
  const KEY = "adr-route-enter";
  const root = document.documentElement;

  function save(direction){
    try{ sessionStorage.setItem(KEY,direction); }catch(_){}
  }

  function read(){
    try{
      const direction=sessionStorage.getItem(KEY);
      if(direction) sessionStorage.removeItem(KEY);
      return direction;
    }catch(_){
      return null;
    }
  }

  function primary(event){
    return event.button===0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
  }

  document.addEventListener("DOMContentLoaded",()=>{
    const direction=read();

    if(direction==="forward"){
      document.body.classList.add("route-enter-forward");
    }else if(direction==="back"){
      if(document.body.classList.contains("series-home")){
        const target=document.getElementById("episodios");
        if(target){
          history.scrollRestoration="manual";
          window.scrollTo({top:target.offsetTop,left:0,behavior:"auto"});
        }
      }
      document.body.classList.add("route-enter-back");
    }

    root.classList.remove("route-entering");

    document.addEventListener("click",(event)=>{
      const link=event.target.closest("a");
      if(!link || !primary(event)) return;

      if(
        document.body.classList.contains("series-home") &&
        link.matches(".home-episode[href^='episodio-']")
      ){
        save("forward");
        return;
      }

      if(
        !document.body.classList.contains("series-home") &&
        link.getAttribute("href")?.startsWith("index.html")
      ){
        event.preventDefault();
        save("back");
        window.location.href="index.html#episodios";
        return;
      }

      if(link.matches(".next-episode[href^='episodio-']")){
        save("forward");
      }
    },true);
  });
})();
