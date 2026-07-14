A few months ago I watched a team paste their entire product manual into ChatGPT and hope for the best. The answers sounded confident. Half of them were wrong. The model was guessing because it never actually had the manual in front of it when the question was asked.

That is the gap RAG fills.

## What RAG actually is

RAG stands for Retrieval Augmented Generation. The name is awkward. The idea is not.

You give the system your documents. When someone asks a question, the system finds the parts of those documents that matter, puts them in the prompt, and only then asks the language model to write an answer.

Search first. Write second.

Without that search step, you are asking the model to answer from memory. With RAG, you are asking it to answer from the pages you handed it a moment ago. The difference shows up the first time someone asks about a feature you shipped last month or a policy that only exists in an internal PDF.

## The architecture in one view

![How RAG connects documents, search, and a language model](/images/blog/rag-architecture-tech.png)

There are three phases: ingest your files, retrieve the right chunks when a question arrives, and generate a reply grounded in what was retrieved. Everything else is detail around those three moves.

The diagram above is the whole pipeline. Documents go in on the left. A grounded answer comes out on the right. The work in the middle is what makes chatbots useful over private data instead of generic training text.

## Phase 1: Getting your documents into the system

You start with sources you already have. PDFs, help articles, internal wikis, exported Notion pages, plain text files. None of that lives inside the base model. You have to bring it in.

The system breaks each document into chunks. A chunk might be a section under a heading, a few paragraphs, or a fixed number of tokens. Small pieces matter because the model can only read so much at once. You are not going to shove a 400 page PDF into a single prompt.

Each chunk is passed through an embedding model. That model turns text into a list of numbers that capture meaning. Two sentences about the same idea land close together even if they use different words. "Reset my password" and "I forgot my login" should end up near each other in that number space.

Those numbers get stored in a vector database. Think of it as a search index built for meaning rather than exact keyword matches.

This ingest work usually runs offline. You are not doing it on every user question. You run it when documents change. Add a new help article, reindex overnight, and the bot knows about it tomorrow.

## Phase 2: Finding the right context at question time

A user asks something concrete. Maybe "How do I reset my API key?" or "What changed in the March release notes?"

The question gets embedded the same way the chunks were. The system compares that embedding against everything in the store and pulls back the closest matches. That is the retrieval step.

You typically take the top few chunks, not one, because a single paragraph might miss part of the answer. You might take five. You might take ten. There is tuning involved, and it depends on how long your answers need to be.

Good retrieval makes RAG feel smart. Bad retrieval makes the whole thing fall apart no matter how good the model is. I have seen teams swap GPT models three times before realizing the wrong paragraphs were being pulled into the prompt every single time.

## Phase 3: Generating the answer

Now the model receives a prompt that looks roughly like this: here is the user's question, here are excerpts from our documents, answer using this material, and say you do not know if the excerpts are not enough.

That last instruction matters. Teams skip it and then wonder why the bot invents policy details. You want the model allowed to stop.

The output is the generated answer. If you build the product well, you also show which document each part came from. Users trust responses they can verify. Citations are not decoration. They are how you catch retrieval mistakes before they spread.

## Why this pattern shows up everywhere now

Plain chatbots are trained on public text. They do not know your pricing page, your bug tracker, or the email you sent customers yesterday.

RAG lets you update what the bot knows by updating the document index. No full model retrain. Add a file, reindex, done.

You also control cost. Sending every document on every question would be impossible. Retrieval keeps each request small enough to fit in the model's context window and your budget.

If you have used a docs site with an "Ask AI" box, or uploaded files to a chat tool and queried them, you have already used something in this family. The labels change. The pattern does not.

## RAG compared to fine tuning

People mix these up. They solve different problems.

![RAG versus fine tuning: when to use each approach](/images/blog/rag-vs-finetuning-tech.png)

RAG is about facts and sources. It answers from material you provide at query time. When your docs change, you refresh the index.

Fine tuning changes the model itself. It is useful when you want a specific tone, a fixed output format, or behavior baked into the weights. It is not a shortcut for giving the model new files to read next Tuesday.

In practice I see teams combine them. RAG for knowledge. Fine tuning when the assistant needs to sound like the brand or follow a strict template every time. One handles what the bot knows. The other handles how it speaks.

## What separates a demo from something you can ship

Chunk size is the first lever people ignore. Chunks that are too large send vague blobs into the prompt. Chunks that are too small lose context. Start near paragraph boundaries and test with real questions your users ask, not the ones you wish they would ask.

Source quality matters more than model choice. If you scrape messy HTML full of navigation menus, retrieval will surface junk. Clean the text before it ever gets embedded. Your future self will thank you when support tickets stop citing sidebar links as official policy.

Hybrid search helps in production. Pure vector search misses exact strings like error codes or product SKUs. Many systems run keyword search and vector search together, then merge results. That one change fixes a surprising number of "it works in the demo" problems.

Always test retrieval on its own. Before you blame the language model, ask whether the right chunk was even in the prompt. Most RAG failures I have debugged were retrieval failures wearing a chatbot costume.

## A reasonable way to learn it hands on

You do not need a massive platform to understand the flow. Take one document you know well. Split it into chunks. Embed them into any vector store you can stand up in an afternoon. Write twenty questions you expect someone to ask. See if the retrieved chunks contain the answer.

If that works, you understand the hard part. The rest is plumbing, monitoring, and the slow work of cleaning source files.

## What comes next on NeuralHub

This post is the map. Follow up pieces here will walk through chunk sizing, hybrid search, and a small pipeline you can run locally. If there is a topic you want covered first, send a note through the contact page.

## Sources worth reading

The [LangChain RAG overview](https://python.langchain.com/docs/concepts/rag/) explains the moving parts without assuming you already run a cluster. OpenAI's [embeddings guide](https://platform.openai.com/docs/guides/embeddings) is the clearest short reference on what embeddings are for. For a neutral definition of the term, the [Wikipedia entry on retrieval augmented generation](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) is a decent starting point.

## Closing thought

RAG does not make a language model smarter. It makes the model better informed for your situation. That distinction is what keeps answers relevant when the knowledge lives in your files, not in training data from two years ago.

If you are building a chatbot over documents you actually care about, this is the pattern worth learning first.
