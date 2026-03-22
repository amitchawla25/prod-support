
import React from 'react';
import { Link } from 'react-router-dom';
import { Developer } from '../types/product';
import { BadgeCheck, User } from 'lucide-react';

interface DeveloperShowcaseProps {
  developers: Developer[];
  isLoading?: boolean;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-border/30 overflow-hidden animate-pulse">
    <div className="h-48 w-full bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
    </div>
  </div>
);

const EmptySlotCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-dashed border-[#1E3A8A]/30 overflow-hidden flex flex-col items-center justify-center p-8 text-center min-h-[280px]">
    <div className="h-16 w-16 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center mb-4">
      <User className="h-8 w-8 text-[#1E3A8A]/40" />
    </div>
    <p className="text-sm text-muted-foreground mb-3">Be one of the first verified developers</p>
    <Link
      to="/register"
      state={{ userType: 'developer' }}
      className="text-sm font-medium text-[#1E3A8A] hover:underline"
    >
      Join as a developer →
    </Link>
  </div>
);

const DeveloperShowcase: React.FC<DeveloperShowcaseProps> = ({ developers, isLoading = false }) => {
  // Always show 4 slots
  const SLOTS = 4;
  const slots = Array.from({ length: SLOTS }, (_, i) => developers[i] ?? null);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="heading-2 mb-2">Developers Ready to Help</h2>
            <p className="text-muted-foreground max-w-2xl">
              Verified developers who've been through our process and are available now
            </p>
          </div>
          <Link
            to="/search"
            className="mt-4 md:mt-0 group inline-flex items-center text-[#1E3A8A] font-medium"
          >
            Browse all developers
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: SLOTS }).map((_, i) => <SkeletonCard key={i} />)
            : slots.map((developer, i) =>
                developer === null ? (
                  <EmptySlotCard key={i} />
                ) : (
                  <div
                    key={developer.id}
                    className="bg-white rounded-xl shadow-sm border border-border/30 overflow-hidden transition-all hover:shadow-md hover:border-[#00B4D8]/30"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {developer.image ? (
                        <img
                          src={developer.image}
                          alt={developer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#1E3A8A]/5">
                          <User className="h-16 w-16 text-[#1E3A8A]/30" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${developer.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {developer.online ? 'Available Now' : 'Available'}
                        </div>
                      </div>
                      {developer.premiumVerified && (
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-[#1E3A8A]">
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-lg truncate mb-1">{developer.name}</h3>

                      {developer.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{developer.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-4">
                        {(developer.skills || []).slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs rounded-full bg-[#1E3A8A]/5 text-[#1E3A8A]"
                          >
                            {skill}
                          </span>
                        ))}
                        {(developer.skills || []).length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#1E3A8A]/5 text-[#1E3A8A]">
                            +{developer.skills.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        <div className="text-[#00B4D8] font-medium">
                          {developer.hourlyRate > 0 ? `$${developer.hourlyRate}/hr` : 'Rate on request'}
                        </div>
                        <Link
                          to={`/developer-profiles/${developer.id}`}
                          className="text-sm font-medium text-[#1E3A8A] hover:text-[#00B4D8] transition-colors"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              )}
        </div>
      </div>
    </section>
  );
};

export default DeveloperShowcase;
