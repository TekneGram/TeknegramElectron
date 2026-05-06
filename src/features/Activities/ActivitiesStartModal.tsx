 import type { ActivityType } from "@/app/ports/activities.ports";
 import "@/styles/button-styles.css";
 import "@/styles/shells.css";
 import "@/styles/text-style.css";
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
      if (pendingActivityType === "vocab_activities") {
          return {
              title: "Start vocabulary activity?",
              body: `Create a new vocabulary activity for ${projectName}.`,
              confirmLabel: "Start Vocabulary",
          };
      }

      if (pendingActivityType === "lb_activities") {
          return {
              title: "Start lexical bundles activity?",
              body: `Create a new lexical bundles activity for ${projectName}.`,
              confirmLabel: "Start Lexical Bundles",
          };
      }

      if (pendingActivityType === "collocation_activities") {
          return {
              title: "Start collocation activity?",
              body: `Create a new collocation activity for ${projectName}.`,
              confirmLabel: "Start Collocation",
          };
      }

      if (pendingActivityType === "dependency_activities") {
          return {
              title: "Start dependency activity?",
              body: `Create a new dependency activity for ${projectName}.`,
              confirmLabel: "Start Dependency",
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
              <div className="activities-start-modal-panel shell-panel shell-radius-4xl shell-surface-modal shell-shadow-modal">
                  <p className="activities-start-modal-eyebrow eyebrow-text eyebrow-text-sm">Create Activity</p>
                  <h2 id="activities-start-modal-title">{copy.title}</h2>
                  <p className="activities-start-modal-copy">{copy.body}</p>

                  <div className="activities-start-modal-actions">
                      <button
                          type="button"
                          className="button-secondary button-size-md"
                          onClick={onCancel}
                          disabled={isSubmitting}
                      >
                          Cancel
                      </button>
                      <button
                          type="button"
                          className="button-primary button-size-md"
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
