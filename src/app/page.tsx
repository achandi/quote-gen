"use client";
import { Amplify } from "aws-amplify";
import awsExports from "@/aws-exports";

import {
  API,
  GRAPHQL_AUTH_MODE,
  GraphQLQuery,
  GraphQLResult,
} from "@aws-amplify/api";
import { quotesQueryName, generateAQuote } from "@/graphql/queries";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";

//Components
import {
  GradientBackgroundContainer,
  BackgroundImageFirst,
  BackgroundImageSecond,
  FooterContainer,
  FooterLink,
  RedSpan,
  QuoteGeneratorContainer,
  QuoteGeneratorInnerContainer,
  QuoteGeneratorTitle,
  QuoteGeneratorSubTitle,
  QuoteGeneratorButton,
  QuoteGeneratorButtonText,
} from "@/components/QuoteGenerator/QuoteGeneratorStyled";

// Assets
import Clouds1 from "../assets/cloud-and-thunder.png";
import Clouds2 from "../assets/cloudy-weather.png";
import QuoteGeneratorModal from "@/components/QuoteGenerator/QuoteGenerator";

//need to add this configuriation again because amplify is not yet compatible with nextjs app router
//https://stackoverflow.com/a/76259609
Amplify.configure({ ...awsExports, ssr: true });

// interface for our appsync <> lambda JSON response
interface GenerateAQuoteData {
  generateAQuote: {
    statusCode: number;
    headers: { [key: string]: string };
    body: string;
  };
}

///interface dynamodb obj
interface UpdateQuoteGenData {
  id: string;
  queryName: string;
  quotesGenerated: number;
  createdAt: string;
  updatedAt: string;
}

//type guard for fetch func
function isGraphQLResultForQuotesQueryName(
  response: any
): response is GraphQLResult<{
  quotesQueryName: {
    items: [UpdateQuoteGenData];
  };
}> {
  return (
    response.data &&
    response.data.quotesQueryName &&
    response.data.quotesQueryName.items
  );
}

export default function Home() {
  const [numberOfQuotes, setNumberOfQuotes] = useState<Number | null>(0);
  const [openGenerator, setOpenGenerator] = useState<boolean>(false);
  const [processingQuote, setProcessingQuote] = useState<boolean>(false);
  const [quoteReceived, setQuoteReceived] = useState<String | null>(null); //base64 encoded string
  //function to fetch our DynamoDB object (quotes generated)
  const updateQuoteInfo = async () => {
    try {
      const response = await API.graphql<UpdateQuoteGenData>({
        query: quotesQueryName,
        authMode: GRAPHQL_AUTH_MODE.AWS_IAM,
        variables: {
          queryName: "LIVE",
        },
      });
      console.log({ response });
      if (!isGraphQLResultForQuotesQueryName(response)) {
        throw new Error("Unexpected response from API.graphql");
      }
      if (!response.data) {
        throw new Error("Response data is undefined");
      }
      const receivedNumberOfQuotes =
        response.data.quotesQueryName.items[0].quotesGenerated;
      setNumberOfQuotes(receivedNumberOfQuotes);
    } catch (err) {
      console.log("quote generator error:", err);
    }
  };

  useEffect(() => {
    updateQuoteInfo();
  }, []);

  //functions for generator modal
  const handleCloseGenerator = () => {
    setOpenGenerator(false);
    setProcessingQuote(false);
    setQuoteReceived(null);
  };

  const handleOpenGenerator = async (e: React.SyntheticEvent) => {
    e.preventDefault(); //run a function without reloading the page
    setOpenGenerator(true);
    setProcessingQuote(true);
    try {
      // Run Lambda Function
      const runFunction = "runFunction";
      const runFunctionStringified = JSON.stringify(runFunction);
      const response = await API.graphql<GraphQLQuery<GenerateAQuoteData>>({
        query: generateAQuote,
        authMode: GRAPHQL_AUTH_MODE.AWS_IAM,
        variables: {
          input: runFunctionStringified,
        },
      });
      const responseStringified = JSON.stringify(response);
      const responseReStringified = JSON.stringify(responseStringified);
      const bodyIndex = responseReStringified.indexOf("body=") + 5;
      const bodyAndBase64 = responseReStringified.substring(bodyIndex);
      const bodyArray = bodyAndBase64.split(",");
      const body = bodyArray[0];
      setQuoteReceived(body);

      // End state:
      setProcessingQuote(false);

      // Fetch if any new quotes were generated from counter
      updateQuoteInfo();
    } catch (err) {
      console.log("error generating quote:", err);
      setProcessingQuote(false);
    }
  };

  return (
    <>
      <Head>
        <title>Quote Generator</title>
        <meta name="description" content="A fun project to generate quotes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Background */}
      <GradientBackgroundContainer>
        {/* Background Images */}
        <BackgroundImageFirst
          src={Clouds1}
          height="300"
          alt="First Cloudy background"
        />
        <BackgroundImageSecond
          src={Clouds2}
          height="300"
          alt="First Cloudy background"
        />

        {/* quote generator modal */}
        <QuoteGeneratorModal
          open={openGenerator}
          close={handleCloseGenerator}
          processingQuote={processingQuote}
          setProcessingQuote={setProcessingQuote}
          quoteReceived={quoteReceived}
          setQuoteReceived={setQuoteReceived}
        />

        {/* quote generator */}
        <QuoteGeneratorContainer>
          <QuoteGeneratorInnerContainer>
            <QuoteGeneratorTitle>Daily Inspiration Quote</QuoteGeneratorTitle>
            <QuoteGeneratorSubTitle>
              Generate a quote card for inspiration! From{" "}
              <FooterLink
                href="https://www.zenquotes.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ZenQuotes
              </FooterLink>
            </QuoteGeneratorSubTitle>

            <QuoteGeneratorButton onClick={handleOpenGenerator}>
              <QuoteGeneratorButtonText>
                Generate Quote
              </QuoteGeneratorButtonText>
            </QuoteGeneratorButton>
          </QuoteGeneratorInnerContainer>
        </QuoteGeneratorContainer>

        {/* Footer */}
        <FooterContainer>
          <>
            Quotes Generated: {numberOfQuotes}
            <br />
            Developed with <RedSpan>❤️</RedSpan> by{" "}
            <FooterLink
              href="https://www.github.com/achandi"
              target="_blank"
              rel="noopener noreferrer"
            >
              @achandi
            </FooterLink>
          </>
        </FooterContainer>
      </GradientBackgroundContainer>
    </>
  );
}
