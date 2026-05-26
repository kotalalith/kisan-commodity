import InsightsPanel from "../components/InsightsPanel";
import { useLanguage } from "../context/LanguageContext";

export default function Insights() {
  const { t } = useLanguage();
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('marketInsights')}</h2>
        <p className="text-gray-600">{t('deepAnalysis')}</p>
      </div>
      <div className="mb-8">
        <InsightsPanel />
      </div>
    </>
  );
}
