import Navbar from "~/Components/Navbar";
import type { Route } from "./+types/home";

import ResumeCard from "~/Components/ResumeCard";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "resumyze" },
    { name: "description", content: "smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const items = (await kv.list("resume:*", true)) as KVItem[];
      const parsedResumes = items?.map(
        (resume) => JSON.parse(resume.value) as Resume,
      );

      console.log("parsedResumes", parsedResumes);
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, [kv]);

  const handleDeleteResume = async (
    id: string,
    resumePath?: string,
    imagePath?: string,
  ) => {
    setDeleteLoading(id);

    // Optimistically remove the resume from UI so the card disappears immediately
    setResumes((prevResumes) =>
      prevResumes.filter((resume) => resume.id !== id),
    );

    try {
      // Try removing files; silently skip if they don't exist
      if (resumePath) {
        try {
          await fs.delete(resumePath);
        } catch (err) {
          // Silently log - files may not exist or already deleted
          console.debug(`Resume file not found: ${resumePath}`);
        }
      }

      if (imagePath) {
        try {
          await fs.delete(imagePath);
        } catch (err) {
          // Silently log - files may not exist or already deleted
          console.debug(`Image file not found: ${imagePath}`);
        }
      }

      // Delete the KV entry to permanently remove from storage
      await kv.delete(`resume:${id}`);
      console.log(`Resume ${id} permanently deleted`);
    } catch (error) {
      console.error("Delete resume failed", error);
      // Don't alert - the card is already removed from UI, which is the main goal
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <>
      <main className="bg-[url('/public/images/bg-main.svg')] bg-cover">
        <Navbar />

        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Track Your Application & Resume Ratings</h1>
            {!loadingResumes && resumes?.length === 0 ? (
              <h2>
                No resumes found. Upload your first resume to get feedback
              </h2>
            ) : (
              <h2>Review your submissions and check AI-Powered feedback</h2>
            )}
          </div>
          {loadingResumes && (
            <div className="flex flex-col items-center justify-center">
              <img
                src="/public/images/resume-scan-2.gif"
                alt="scan-resume"
                className="w-[200px]"
              />
            </div>
          )}

          {!loadingResumes && resumes.length > 0 && (
            <div className="resumes-section">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={handleDeleteResume}
                  deleting={deleteLoading === resume.id}
                />
              ))}
            </div>
          )}

          {!loadingResumes && resumes?.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 gap-2">
              <Link
                to="/upload"
                className="primary-button w-fit text-xl font-semibold"
              >
                Upload Resume
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
