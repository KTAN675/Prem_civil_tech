import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex flex-col justify-center border-b border-outline-variant overflow-hidden">
      <div className="absolute inset-0 bg-surface-container-lowest">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgw0kQBHesVeusTS8wYkTrXKWl1KgYAJySLycRWGMqbz0I4mlTd8plHwfh4MVrkHSdal-7AWFiD1EOVcjfzofugAqxqjEirAnANCVnrx171lwbAmjGvZSxa3SurYKMqVyrnIZrQRyOW6tB_B8HtJFD_78oAn4Lg_DM0nr8sWLhLTjwFH3tILCtWhULNdtch-lnc6AeaoJLR8GUeP8kcNII_0g8E-bJtE-8TT6oxEvIz4W45ysiWSgLi8DyqKHNzh0sbNqtRwF9ybQ')" 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
      </div>
      <div className="relative z-10 px-gutter w-full max-w-max-width mx-auto py-margin-desktop">
        <div className="max-w-3xl border-l-4 border-primary-container pl-6 md:pl-10">
          <div className="inline-flex items-center gap-2 mb-6 bg-surface-container border border-outline px-3 py-1">
            <span className="material-symbols-outlined text-primary-container text-sm">engineering</span>
            <span className="font-label-sm text-label-sm uppercase text-primary tracking-widest font-semibold">Industrial Integrity</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-6 uppercase tracking-tighter text-shadow-hard leading-none">
            Building Strong <br/><span className="text-primary-container">Foundations</span> You Can Trust
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl bg-surface-container/60 p-4 border border-outline-variant backdrop-blur-sm">
            Expertise in structural repairs, waterproofing, and civil engineering solutions for high-stakes industrial and residential projects.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/get-quote" className="bg-primary-container text-black font-title-md text-title-md px-8 py-4 border border-primary-container hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.4)] flex items-center gap-2">
              Request a Quote
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <Link to="/projects" className="bg-transparent text-on-surface font-title-md text-title-md px-8 py-4 border border-outline hover:border-on-surface transition-all flex items-center gap-2 bg-surface/50 backdrop-blur-sm">
              View Projects
              <span className="material-symbols-outlined">domain</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
