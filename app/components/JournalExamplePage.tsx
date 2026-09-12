'use client';

import {
  JournalContainer,
  ArchCard,
  PhotoFrame,
  SectionHeader,
  QuoteCard,
  MessageCard,
  PhotoGrid,
  JournalDivider,
  FloatingBackButton,
} from './JournalLayout';

/**
 * Example page demonstrating the Journal Layout components
 * This can be used as a reference for creating other journal-style pages
 */
export default function JournalExamplePage() {
  return (
    <JournalContainer>
      <FloatingBackButton href="/home" label="Home" />
      
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Welcome Section */}
        <SectionHeader
          title="A Collection of Moments"
          subtitle="Memories preserved in time"
          delay={0.2}
        />

        {/* Personal Message Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MessageCard
            icon="💖"
            title="Love"
            message="Every moment with you is a treasure worth keeping"
            delay={0.4}
          />
          <MessageCard
            icon="✨"
            title="Dreams"
            message="Together we chase the stars and catch the light"
            delay={0.5}
          />
          <MessageCard
            icon="🌙"
            title="Memories"
            message="In the quiet of the night, I remember every smile"
            delay={0.6}
          />
        </div>

        <JournalDivider />

        {/* Photo Gallery Section */}
        <div>
          <SectionHeader
            title="Captured Memories"
            subtitle="Moments that made us smile"
            delay={0.7}
          />
          
          <PhotoGrid columns={3}>
            <PhotoFrame
              src="/buzz/polaroid/1.jpg"
              alt="Memory 1"
              caption="A beautiful day"
              delay={0.8}
            />
            <PhotoFrame
              src="/buzz/polaroid/2.jpg"
              alt="Memory 2"
              caption="Together forever"
              delay={0.9}
            />
            <PhotoFrame
              src="/buzz/polaroid/foto meet up.jpg"
              alt="Memory 3"
              caption="First meeting"
              delay={1.0}
            />
          </PhotoGrid>
        </div>

        <JournalDivider />

        {/* Quote Section */}
        <QuoteCard
          quote="In a sky full of lanterns, you are the one that shines the brightest"
          author="From me to you"
          delay={1.1}
        />

        {/* Text Content Card */}
        <ArchCard delay={1.2}>
          <h3 
            className="text-2xl md:text-3xl text-lantern-lilac mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            A Letter to You
          </h3>
          <div 
            className="space-y-4 text-lantern-mist/80 leading-relaxed"
            style={{ fontFamily: "'Lora', serif" }}
          >
            <p>
              As I sit here writing this, I'm reminded of all the small moments that made us who we are. 
              The laughter that echoed through empty rooms, the quiet conversations under starlit skies, 
              and the comfortable silence that said more than words ever could.
            </p>
            <p>
              You've been my constant in a world that never stops changing. My safe harbor in the storm, 
              my light in the darkness, and my reason to believe in magic.
            </p>
            <p>
              These pages are filled with memories we've created together, and dreams we're yet to chase. 
              Thank you for being you, and for letting me be part of your story.
            </p>
          </div>
        </ArchCard>

        <JournalDivider />

        {/* Timeline Card */}
        <div>
          <SectionHeader
            title="Our Journey"
            subtitle="Key moments in our story"
            delay={1.3}
          />
          
          <div className="space-y-6">
            <ArchCard delay={1.4} className="relative pl-12">
              <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-lantern-gold shadow-lg shadow-lantern-gold/50" />
              <p className="text-sm text-lantern-gold/70 mb-2" style={{ fontFamily: "'Lora', serif" }}>
                January 2024
              </p>
              <h4 
                className="text-xl text-lantern-lilac-light mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                The Beginning
              </h4>
              <p className="text-lantern-mist/70" style={{ fontFamily: "'Lora', serif" }}>
                Where it all started. A simple hello that changed everything.
              </p>
            </ArchCard>

            <ArchCard delay={1.5} className="relative pl-12">
              <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-lantern-gold shadow-lg shadow-lantern-gold/50" />
              <p className="text-sm text-lantern-gold/70 mb-2" style={{ fontFamily: "'Lora', serif" }}>
                March 2024
              </p>
              <h4 
                className="text-xl text-lantern-lilac-light mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Growing Together
              </h4>
              <p className="text-lantern-mist/70" style={{ fontFamily: "'Lora', serif" }}>
                Learning about each other, discovering shared dreams and quiet moments.
              </p>
            </ArchCard>

            <ArchCard delay={1.6} className="relative pl-12">
              <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-lantern-gold shadow-lg shadow-lantern-gold/50" />
              <p className="text-sm text-lantern-gold/70 mb-2" style={{ fontFamily: "'Lora', serif" }}>
                Today
              </p>
              <h4 
                className="text-xl text-lantern-lilac-light mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                This Moment
              </h4>
              <p className="text-lantern-mist/70" style={{ fontFamily: "'Lora', serif" }}>
                Right here, right now. Creating new memories and celebrating us.
              </p>
            </ArchCard>
          </div>
        </div>

        {/* Closing Message */}
        <ArchCard delay={1.7} className="text-center">
          <p 
            className="text-2xl md:text-3xl text-lantern-lilac-light mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Thank you for being part of my story
          </p>
          <p 
            className="text-lantern-mist/70"
            style={{ fontFamily: "'Lora', serif" }}
          >
            With all my love, always
          </p>
        </ArchCard>
      </div>
    </JournalContainer>
  );
}
