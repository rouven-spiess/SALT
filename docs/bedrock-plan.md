# Proposed additional scope: reviewed asset photo suggestions

**Status:** Proposed future scope; implementation has not started. A separate team-agreed Jira issue and acceptance criteria are required before development. Face recognition is outside the proposed scope.

1. The signed-in frontend sends an asset photo to an authorized backend endpoint. Final photo/create permissions must come from the team's agreed matrix, not the demo policy.
2. The backend checks upload size, actual file signature, dimensions, supported type, and image decoding. Allow JPEG/PNG only initially, strip metadata, and reject invalid or oversized files. Set a conservative byte/pixel limit supported by the chosen model and API transport. Do not trust the extension or Content-Type alone.
3. Only the backend calls Amazon Bedrock using its Lambda IAM role. Restrict bedrock:InvokeModel to the selected approved model or inference profile and required resources. Do not put AWS credentials in React. Choose and verify the model, region, cost limits, and current image support during implementation.
4. Treat all photo content, including text inside the image, as untrusted input. The model suggests only asset category, manufacturer, model, visible condition, and an uncertainty note. No tools, autonomous actions, people identification, face recognition, or automatic saving.
5. Parse the response with a strict schema and reject unknown properties, invalid categories, wrong types, excessive lengths, and malformed JSON. Never use model output as code, HTML, SQL, a storage path, a permission, or a trusted identifier. Return a validation error instead of forwarding raw model output. Confidence is not proof of correctness.
6. Display validated suggestions as an editable draft labeled “AI suggestion — review required.” Let the user correct or reject every field. Keep the photo and all proposed fields out of the asset database until confirmation.
7. Save through a separate backend endpoint only after an explicit “Confirm and save” action. Reauthenticate, recheck action and ownership permissions, and validate the final data again. Bind any server-side draft to its user, expire it, and prevent replay/duplicate saves with an idempotency key.
8. Test unauthorized upload/save, image spoofing and size limits, model refusal/malformed output, prompt injection in images, cancellation, changed suggestions, cross-user drafts, and duplicate confirmation.

If photos are stored, use a private bucket, narrowly scoped upload keys, short-lived presigned URLs only after authorization, encryption, and a cleanup lifecycle agreed by the team. Do not log photos, access tokens, or raw model responses. Audit who confirmed a save and when, using the team's data retention policy.

The suggestion endpoint must not have permission to write asset records. Keep model invocation and record persistence in separate functions/roles where practical. Review is an explicit workflow step, while backend authorization and final schema validation remain the security boundary.
