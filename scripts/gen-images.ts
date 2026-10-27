/* eslint-disable */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "public", "images");
fs.mkdirSync(OUT, { recursive: true });

type Job = { file: string; prompt: string; size: string };

// Valid sizes (multiples of 32, max 2^22 pixels): 1024x1024, 1344x768, 768x1344, 1152x864, 864x1152
const JOBS: Job[] = [
  {
    file: "hero.jpg",
    size: "1344x768",
    prompt:
      "Cinematic wide shot of a muscular male fitness trainer in a dark premium gym, dramatic side lighting, charcoal black background, electric lime green rim light, holding battle ropes, intense focused expression, professional fitness photography, high contrast, moody atmosphere, ultra detailed",
  },
  {
    file: "coach-portrait.jpg",
    size: "768x1344",
    prompt:
      "Professional portrait of a confident male personal trainer, arms crossed, black tank top, dark studio background with subtle lime green accent lighting, athletic muscular build, friendly authoritative expression, premium fitness brand photography, cinematic lighting, ultra detailed",
  },
  {
    file: "service-coaching.jpg",
    size: "1024x1024",
    prompt:
      "Athletic person doing dumbbell training in a premium dark gym, dramatic lighting, electric lime green accents, focused workout, professional fitness photography, cinematic moody atmosphere, ultra detailed",
  },
  {
    file: "service-transformation.jpg",
    size: "1024x1024",
    prompt:
      "Muscular athletic physique torso of a fitness model, dramatic side lighting, dark background, defined muscles, body transformation concept, premium fitness photography, cinematic, ultra detailed",
  },
  {
    file: "service-nutrition.jpg",
    size: "1024x1024",
    prompt:
      "Healthy nutritious meal prep with grilled chicken, rice, vegetables and protein, dark slate background, overhead shot, premium food photography, lime green garnish accent, ultra detailed",
  },
  {
    file: "service-consultation.jpg",
    size: "1024x1024",
    prompt:
      "Two people having an online video consultation on a laptop, modern dark desk setup, lime green ambient lighting, professional coaching concept, premium photography, cinematic, ultra detailed",
  },
  {
    file: "transform-1.jpg",
    size: "1024x1024",
    prompt:
      "Fit athletic woman flexing strong toned physique in premium dark gym, dramatic lime green rim lighting, confident pose, body transformation progress, professional fitness photography, cinematic, ultra detailed",
  },
  {
    file: "transform-2.jpg",
    size: "1024x1024",
    prompt:
      "Muscular athletic man flexing defined physique in premium dark gym, dramatic lime green rim lighting, powerful pose, body transformation progress, professional fitness photography, cinematic, ultra detailed",
  },
  {
    file: "gym-bg.jpg",
    size: "1344x768",
    prompt:
      "Dark moody premium gym interior with dumbbells and equipment, cinematic lighting with electric lime green accent glow, empty atmospheric space, professional architectural photography, ultra detailed",
  },
];

async function runJob(zai: any, job: Job) {
  const outPath = path.join(OUT, job.file);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log("SKIP (exists):", job.file);
    return;
  }
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await zai.images.generations.create({ prompt: job.prompt, size: job.size });
      const b64 = res.data?.[0]?.base64;
      if (!b64) throw new Error("no base64");
      fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
      console.log("OK:", job.file, fs.statSync(outPath).size, "bytes");
      return;
    } catch (e: any) {
      console.error(`FAIL (attempt ${attempt}):`, job.file, e.message);
      if (attempt < 4) await new Promise((r) => setTimeout(r, 20000 * attempt));
    }
  }
}

async function main() {
  const zai = await ZAI.create();
  // sequential with delay to respect rate limits
  for (const job of JOBS) {
    await runJob(zai, job);
    await new Promise((r) => setTimeout(r, 12000));
  }
  console.log("DONE");
}
main().catch((e) => { console.error(e); process.exit(1); });
