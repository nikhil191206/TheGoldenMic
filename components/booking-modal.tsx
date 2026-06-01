"use client";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookingModal({ open, onOpenChange }: BookingModalProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="relative w-full max-w-md mx-6 p-10 border border-border/50 bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-gold-gradient text-2xl font-light tracking-[0.1em] text-center mb-10">
          Book Your Slot
        </h3>

        <form className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 bg-transparent border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors text-sm tracking-wider"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-transparent border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors text-sm tracking-wider"
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full px-4 py-3 bg-transparent border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors text-sm tracking-wider"
          />
          <input
            type="date"
            className="w-full px-4 py-3 bg-transparent border border-border/50 text-foreground focus:border-primary focus:outline-none transition-colors text-sm tracking-wider"
          />
          <button
            type="submit"
            className="mt-4 w-full py-4 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 tracking-[0.2em] text-sm uppercase"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
