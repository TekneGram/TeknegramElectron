 import type { ActivityType } from "@/app/ports/activities.ports";
 import "./styles/activitiesStartModal.css";

  type PendingActivityKind = ActivityType | null;

  interface ActivitiesStartModalProps {
      isOpen: boolean;
      pendingActivityType: PendingActivityKind;
      projectName: string;
      isSubmitting?: boolean;
      onCancel: () => void;
      onConfirm: () => void;
  }

  function getModalCopy(
      pendingActivityType: PendingActivityKind,
      projectName: string,
  ) {
      if (pendingActivityType === "explore_activities") {
          return {
              title: "Start exploration activity?",
              body: `Create a new exploration activity for ${projectName}.`,
              confirmLabel: "Start Activities",
          };
      }

      if (pendingActivityType === "lb_activities") {
          return {
              title: "Start lexical bundles activity?",
              body: `Create a new lexical bundles activity for ${projectName}.`,
              confirmLabel: "Start Lexical Bundles",
          };
      }

      return {
          title: "",
          body: "",
          confirmLabel: "Confirm",
      };
  }

  const ActivitiesStartModal: React.FC<ActivitiesStartModalProps> = ({
      isOpen,
      pendingActivityType,
      projectName,
      isSubmitting = false,
      onCancel,
      onConfirm,
  }) => {
      if (!isOpen || !pendingActivityType) {
          return null;
      }

      const copy = getModalCopy(pendingActivityType, projectName);

      return (
          <div
              className="activities-start-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="activities-start-modal-title"
          >
              <div
                  className="activities-start-modal-backdrop"
                  onClick={isSubmitting ? undefined : onCancel}
              />
              <div className="activities-start-modal-panel">
                  <p className="activities-start-modal-eyebrow">Create Activity</p>
                  <h2 id="activities-start-modal-title">{copy.title}</h2>
                  <p className="activities-start-modal-copy">{copy.body}</p>

                  <div className="activities-start-modal-actions">
                      <button
                          type="button"
                          className="activities-start-modal-cancel"
                          onClick={onCancel}
                          disabled={isSubmitting}
                      >
                          Cancel
                      </button>
                      <button
                          type="button"
                          className="activities-start-modal-confirm"
                          onClick={onConfirm}
                          disabled={isSubmitting}
                      >
                          {isSubmitting ? "Creating..." : copy.confirmLabel}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  export default ActivitiesStartModal;