# Publishing approval

- Before publishing any new or edited blog post, show the user the finished rendered result and ask for explicit approval to publish those posts.
- Do not publish until the user has approved. Creating local files, running previews and checks, and making local Git commits do not require publishing approval.
- Publishing includes pushing to a branch that triggers GitHub Pages deployment, manually dispatching a deployment workflow, and uploading or modifying posts on any public website.
- A request to write or edit a post is not approval to publish it. Approval applies to the reviewed version; ask again if the post content changes materially after approval.
- Keep work local when the user requests a preview or asks to postpone publication.

# Private projects

- Do not include private GitHub or Bitbucket projects in the blog unless the user explicitly authorizes disclosing that specific project.
- This applies to project names, descriptions, repository links, screenshots, daily post content, and technical results derived from private projects.
- Verify repository visibility before including a project or using it as a source. If its public status cannot be confirmed, omit it until the user explicitly allows disclosure.
- General approval to publish a post does not authorize disclosure of a private project. Ask for specific authorization if private-project material is needed.
- Before publishing, check both the generated site and the files and Git history being uploaded for private-project information.
- Run `npm run check:public` before publication. The build also checks GitHub and Bitbucket links against `content/public-sources.json` locally, without making network requests. Add an entry only after independently verifying public visibility; reconfirm visibility before publication. Verify Bitbucket projects without authentication and require `is_private: false`.

# Post content

- Do not publish ideas, proposals, speculative designs, or personal discussions from ChatGPT conversations unless the user explicitly authorizes publishing that specific material.
- Use concrete, publicly documented project work as the source for daily posts. Access to a private conversation does not make its contents suitable for publication.

- When project evidence supports it, mention concrete progress such as firmware size reductions, saved bytes, execution time, or memory use.
- Prefer measured before/after values and name the relevant profile or test conditions. Distinguish emulator results, hardware results, and experimental prototypes.
- Keep each daily post within ten sentences. Store posts in `content/posts/YYYY-MM-DD-short-name.md`.
- Link a YouTube video in a daily post only when that video was published on that post's date. Verify the publication date and record it as `published: 'YYYY-MM-DD'` in the video's metadata.
- Do not repeat the same video across daily posts. If no video was published that day, omit video links. Project pages may keep relevant videos independently of their publication dates.
