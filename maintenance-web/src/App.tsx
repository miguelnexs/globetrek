import { ShoppingBag, Star, Mail, Instagram } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-orange-100 blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[50vh] h-[50vh] rounded-full bg-rose-50 blur-3xl" />
      </div>

      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-stone-200/50 p-10 md:p-16 text-center border border-white relative z-10">
        
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-tr from-stone-100 to-stone-50 p-5 rounded-full ring-1 ring-stone-200 shadow-sm">
            <ShoppingBag className="w-10 h-10 text-stone-800" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 tracking-wide">
          Estamos preparando <br />
          <span className="italic text-stone-500">algo exclusivo</span>
        </h1>
        
        <p className="text-stone-600 mb-10 text-lg leading-relaxed font-light">
          Nuestra boutique online se está renovando para traerte la nueva colección de bolsos y accesorios. 
          La elegancia y el estilo vuelven muy pronto.
        </p>

        <div className="space-y-8">
          <div className="flex items-center justify-center gap-2 text-stone-500 text-sm tracking-widest uppercase">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Nueva Colección 2026</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-stone-100">
            <button className="cursor-pointer group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 text-white rounded-full transition-all duration-300 hover:bg-stone-800 hover:shadow-lg hover:-translate-y-0.5">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Notificarme</span>
            </button>
             <button className="cursor-pointer group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-stone-800 border border-stone-200 rounded-full transition-all duration-300 hover:bg-stone-50 hover:border-stone-300">
              <Instagram className="w-4 h-4" />
              <span className="font-medium">Síguenos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
