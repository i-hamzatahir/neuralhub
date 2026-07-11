import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

function ok(message: string) {
  console.log(`✓ ${message}`);
}

function fail(message: string) {
  console.log(`✗ ${message}`);
}

async function main() {
  console.log("NeuralHub Supabase check (Step 2)\n");

  let errors = 0;

  if (!url) {
    fail("NEXT_PUBLIC_SUPABASE_URL is missing");
    errors++;
  } else if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    fail("NEXT_PUBLIC_SUPABASE_URL should look like https://xxxxx.supabase.co");
    errors++;
  } else {
    ok(`Project URL set (${url})`);
  }

  if (!anonKey) {
    fail("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
    errors++;
  } else if (!anonKey.startsWith("eyJ")) {
    fail("NEXT_PUBLIC_SUPABASE_ANON_KEY should start with eyJ");
    errors++;
  } else {
    ok("Anon key set");
  }

  if (!serviceKey) {
    fail("SUPABASE_SERVICE_ROLE_KEY is missing");
    errors++;
  } else if (!serviceKey.startsWith("eyJ")) {
    fail("SUPABASE_SERVICE_ROLE_KEY should start with eyJ");
    errors++;
  } else if (anonKey && serviceKey === anonKey) {
    fail("Service role key must be different from anon key");
    errors++;
  } else {
    ok("Service role key set (different from anon)");
  }

  if (errors > 0 || !url || !serviceKey) {
    console.log("\nFix the issues above, then run again.");
    process.exit(1);
  }

  const supabase = createClient(url!, serviceKey!);

  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    fail(`Could not list buckets: ${listError.message}`);
    console.log("\nCommon fixes:");
    console.log("  - Wrong SUPABASE_SERVICE_ROLE_KEY (use service_role, not anon)");
    console.log("  - Wrong project URL");
    process.exit(1);
  }

  const media = buckets?.find((b) => b.name === "media");
  if (!media) {
    fail('Bucket "media" not found — create a public bucket named media');
    console.log("\nExisting buckets:", buckets?.map((b) => b.name).join(", ") || "(none)");
    process.exit(1);
  }

  ok('Bucket "media" exists');

  if (!media.public) {
    fail('Bucket "media" is not public — enable Public in Supabase Storage');
    process.exit(1);
  }

  ok('Bucket "media" is public');

  const testPath = `_neuralhub-check/${Date.now()}.txt`;
  const testBody = "neuralhub-step-2-check";

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(testPath, testBody, { contentType: "text/plain", upsert: true });

  if (uploadError) {
    fail(`Test upload failed: ${uploadError.message}`);
    process.exit(1);
  }

  ok("Test upload to media bucket succeeded");

  await supabase.storage.from("media").remove([testPath]);
  ok("Test file cleaned up");

  const { data: publicUrl } = supabase.storage.from("media").getPublicUrl("test");
  if (!publicUrl?.publicUrl?.includes(".supabase.co")) {
    fail("Could not build public URL");
    process.exit(1);
  }

  ok("Public URL generation works");

  console.log("\nStep 2 looks correct. Reply \"Step 2 done\" to continue to Step 3 (Resend).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
