
import React from "react";
import { HelpRequest } from "../../types/helpRequest";
import { Badge } from "../ui/badge";
import CodeBlock from "./TicketDetails/CodeBlock";
import ComplexityBadge from "./TicketDetails/ComplexityBadge";
import UrgencyBadge from "./TicketDetails/UrgencyBadge";

type Props = {
  ticket: HelpRequest;
  userRole?: "client" | "developer" | "admin";
};

const TicketDetails: React.FC<Props> = ({ ticket, userRole = "client" }) => {
  // Safely normalize fields for backward compatibility
  const {
    description,
    technical_area, // string[]
    complexity_level,
    communication_preference,
    budget_range,
    estimated_duration,
    urgency,
    code_snippet,
  } = ticket;

  return (
    <div className="space-y-6">
      {/* Description Section - Visible to All */}
      <section className="bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{description}</p>
        {code_snippet && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Code Snippet</h3>
            <CodeBlock code={code_snippet} />
          </div>
        )}
      </section>
      
      {/* Technical Requirements - Visible to All */}
      <section className="bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Technical Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {!!technical_area?.length && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required Technical Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {technical_area.map((area) => (
                  <Badge key={area} variant="outline" className="bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {complexity_level && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Complexity Level
              </h3>
              <ComplexityBadge level={complexity_level} />
            </div>
          )}
          {!!communication_preference?.length && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Communication Preference
              </h3>
              <div className="flex flex-wrap gap-2">
                {communication_preference.map((pref) => (
                  <Badge key={pref} variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                    {pref}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Project Details - Conditionally shown based on role */}
      {(userRole === "developer" || userRole === "admin") && (
        <section className="bg-white dark:bg-zinc-900 p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {typeof estimated_duration === "number" && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Duration
                </h3>
                <p>{estimated_duration} hour{estimated_duration !== 1 ? 's' : ''}</p>
              </div>
            )}
            {budget_range && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget Range
                </h3>
                <p>{budget_range}</p>
              </div>
            )}
            {urgency && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Urgency
                </h3>
                <UrgencyBadge urgency={urgency} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default TicketDetails;
