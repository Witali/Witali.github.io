# Publishing approval

- Before publishing any new or edited blog post, show the user the finished rendered result and ask for explicit approval to publish those posts.
- Do not publish until the user has approved. Creating local files, running previews and checks, and making local Git commits do not require publishing approval.
- Publishing includes pushing to a branch that triggers GitHub Pages deployment, manually dispatching a deployment workflow, and uploading or modifying posts on any public website.
- A request to write or edit a post is not approval to publish it. Approval applies to the reviewed version; ask again if the post content changes materially after approval.
- Keep work local when the user requests a preview or asks to postpone publication.

# Post content

- When project evidence supports it, mention concrete progress such as firmware size reductions, saved bytes, execution time, or memory use.
- Prefer measured before/after values and name the relevant profile or test conditions. Distinguish emulator results, hardware results, and experimental prototypes.
- Keep each daily post within ten sentences. Store posts in `content/posts/YYYY-MM-DD-short-name.md`.
