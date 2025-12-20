import Bounded from "@/components/Bounded";
import Image from "next/image";
import clsx from "clsx";

const bentoFeatures = [
  {
    title: "AI Paraphrase Detection",
    body: "Advanced algorithms detect sophisticated paraphrasing attempts, not just direct copying. Our deep learning models understand semantic meaning to catch students who try to reword sources.",
    image: "/placeholder-ai.svg",
    wide: false,
  },
  {
    title: "Code Plagiarism Scanner",
    body: "Purpose-built for programming assignments. Detects copied code even when variable names are changed, supports 50+ languages including Python, Java, C++, and JavaScript.",
    image: "/placeholder-code.svg",
    wide: true,
  },
  {
    title: "LMS Integration",
    body: "Works seamlessly within Canvas, Blackboard, Moodle, Google Classroom, and Schoology. Students submit directly through your existing workflow—no new logins required.",
    image: "/placeholder-lms.svg",
    wide: false,
  },
  {
    title: "Time-Saving Batch Processing",
    body: "Upload entire classes worth of assignments at once. Get comprehensive reports in minutes, not hours. Focus on teaching, not hunting for plagiarism.",
    image: "/placeholder-batch.svg",
    wide: false,
  },
];

const Bento = (): JSX.Element => {
  return (
    <Bounded>
      <h2 className="text-balance text-center text-5xl font-medium text-slate-900 md:text-7xl">
        Comprehensive academic integrity <em className="bg-gradient-to-b from-blue-500 to-blue-700 bg-clip-text not-italic text-transparent">solutions</em>
      </h2>

      <div className="mx-auto mt-6 max-w-md text-balance text-center text-slate-600">
        <p>Everything educators need to maintain academic standards and detect plagiarism across all types of assignments.</p>
      </div>

      <div className="mt-16 grid max-w-4xl grid-rows-[auto_auto_auto] gap-8 md:grid-cols-3 md:gap-10">
        {bentoFeatures.map((item) => (
          <div
            className={clsx(
              "glass-container row-span-3 grid grid-rows-subgrid gap-4 rounded-lg bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm",
              item.wide ? "md:col-span-2" : "md:col-span-1",
            )}
            key={item.title}
          >
            <h3 className="text-2xl text-slate-900">{item.title}</h3>
            <div className="max-w-md text-balance text-slate-600">
              <p>{item.body}</p>
            </div>
            <Image 
              src={item.image} 
              alt={item.title}
              width={400}
              height={144}
              className="max-h-36 w-auto" 
            />
          </div>
        ))}
      </div>
    </Bounded>
  );
};

export default Bento;
