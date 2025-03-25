import { Button } from "@heroui/react";
import { useConfig } from "../../config";
import { useTranslations } from "next-intl";

export function SocialLogin() {
  const t = useTranslations("common");

  const config = useConfig();
  const auth = config.auth || {};

  if (typeof auth === "boolean") {
    return null;
  }

  const providers = Object.keys(auth)
    .filter((key) => key !== "credentials")
    .filter((key) => auth[key as keyof typeof auth]);

  return (
    <>
      {providers.length > 0 && (
        <div className="relative my-6 flex items-center">
          <div className="w-full border-t border-gray-300" />
          <div className="relative flex justify-center text-sm px-2">
            <span className="px-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {t("OR_CONTINUE_WITH")}
            </span>
          </div>
          <div className="w-full border-t border-gray-300" />
        </div>
      )}

      <div className="flex justify-center items-center gap-5">
        {/* Social login buttons */}
        {auth?.github && (
          <Button type="button" isIconOnly>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </Button>
        )}

        {auth?.fb && (
          <Button type="button" isIconOnly>
            <svg
              className="h-5 w-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </Button>
        )}

        {auth?.google && (
          <Button type="button" isIconOnly>
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
            </svg>
          </Button>
        )}

        {auth?.x && (
          <Button type="button" isIconOnly>
            <svg
              width="24"
              height="24"
              viewBox="0 0 1200 1227"
              className="h-5 w-5 dark:fill-white fill-black"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
            </svg>
          </Button>
        )}
      </div>
    </>
  );
}
