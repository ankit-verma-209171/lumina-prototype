# Lumina AI

Your Software Engineering companion.

## Questions that Lumina AI resolves

- Have complex, undocumented projects you want to understand but having hard time with it?

- Want to start contributing to a project but don't know where to start but having trouble finding and understanding conventions followed in the project?

- Want insights about projects but no one to guide you?

If you're someone who falls under these questions, Lumina AI is for you.

## Key Idea

- Lumina AI will help you better understand any kind of project present in github repository.
- You can interact with AI and ask a wide range of project related questions.
- These questions may include but not limited to:
  - Project overview
  - Writing onboarding guide
  - Understanding a feature
  - Asking to write unit test for a feature

## Getting Started

1. Add `.env` with following environment variables
```shell
GOOGLE_GENERATIVE_AI_API_KEY=<gemini-key-for-chat>
AI_API_KEY_1=<gemini-key-summarization-1>
AI_API_KEY_2=<gemini-key-summarization-2>
AI_API_KEY_3=<gemini-key-summarization-3>
GITHUB_PAT=<github-personal-access-token>
DEBUG=yes
```
2. Run the server using
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## How it works

> [!NOTE]
> Note: Make sure you've added the `.env` file

1. User will enter the github project link for the project user wants to understand 
2. The AI will understand the project
3. User will be redirected to chat screen
4. Now user can interact with AI to understand the project
