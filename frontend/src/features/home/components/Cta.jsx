import { Link } from 'react-router-dom';

export default function Cta() {
  return (
    <section className="bg-surface-container border-b border-outline-variant py-16">
      <div className="max-w-max-width mx-auto px-gutter text-center flex flex-col items-center">
        <span className="material-symbols-outlined text-primary-container text-5xl mb-6">edit_document</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tighter mb-4 max-w-2xl mx-auto">
          Have a project in mind? Get a free estimate
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
          Our engineering team is ready to analyze your requirements and provide a detailed, pragmatic proposal.
        </p>
        <Link to="/get-quote" className="bg-primary-container text-black font-title-md text-title-md px-10 py-4 border border-primary-container hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.4)]">
          Get a Quote Now
        </Link>
      </div>
    </section>
  );
}
