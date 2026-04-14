import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { progressDocumentToRow, progressRowsToCsv, type FirestoreDocument, type ProgressReportRow } from "./progress-report.js";

type ServiceAccount = {
  client_email?: string;
  private_key?: string;
  project_id?: string;
};

type PullProgressReportOptions = {
  courseSlugs: string[];
  firebaseProjectId?: string;
  serviceAccountPath: string;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function splitCourseFlag(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function readServiceAccount(filePath: string) {
  return JSON.parse(await readFile(path.resolve(filePath), "utf8")) as ServiceAccount;
}

export async function getAccessToken(serviceAccount: ServiceAccount) {
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error("Service account JSON must include client_email and private_key.");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      aud: "https://oauth2.googleapis.com/token",
      exp: nowSeconds + 3600,
      iat: nowSeconds,
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/datastore"
    })
  );
  const unsignedJwt = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(serviceAccount.private_key);
  const assertion = `${unsignedJwt}.${base64Url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer"
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate service account: ${response.status} ${await response.text()}`);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("OAuth response did not include an access_token.");
  }

  return payload.access_token;
}

function encodeDocumentPath(pathname: string) {
  return pathname
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function listFirestoreDocuments(firebaseProjectId: string, collectionPath: string, accessToken: string) {
  const documents: FirestoreDocument[] = [];
  let pageToken = "";

  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseProjectId)}/databases/(default)/documents/${encodeDocumentPath(collectionPath)}`
    );
    url.searchParams.set("pageSize", "300");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to read Firestore path "${collectionPath}": ${response.status} ${await response.text()}`);
    }

    const payload = (await response.json()) as {
      documents?: FirestoreDocument[];
      nextPageToken?: string;
    };
    documents.push(...(payload.documents ?? []));
    pageToken = payload.nextPageToken ?? "";
  } while (pageToken);

  return documents;
}

export async function pullProgressReportRows(options: PullProgressReportOptions) {
  const serviceAccount = await readServiceAccount(options.serviceAccountPath);
  const firebaseProjectId = options.firebaseProjectId ?? serviceAccount.project_id;
  if (!firebaseProjectId) {
    throw new Error("Provide --firebase-project <id> or use a service account JSON with project_id.");
  }

  const accessToken = await getAccessToken(serviceAccount);
  const rows: ProgressReportRow[] = [];

  for (const courseSlug of options.courseSlugs) {
    const documents = await listFirestoreDocuments(firebaseProjectId, `projects/${courseSlug}/users`, accessToken);
    rows.push(...documents.map((document) => progressDocumentToRow(courseSlug, document)));
  }

  return {
    csv: progressRowsToCsv(rows),
    firebaseProjectId,
    rows
  };
}
