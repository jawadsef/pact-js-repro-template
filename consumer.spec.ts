import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  SpecificationVersion,
  PactV3,
  LogLevel,
  MatchersV3,
} from "@pact-foundation/pact";

chai.use(chaiAsPromised);

const { expect } = chai;

describe("Pact Consumer Test", () => {
  const pact = new PactV3({
    consumer: "myconsumer",
    provider: "myprovider",
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    logLevel: "trace",
  });

  it("creates a pact to verify", async () => {
    const formData = new FormData();

    formData.append("name", "John Doe");

    await pact
      .addInteraction({
        uponReceiving: "a request for a foo",
        withRequest: {
          method: "POST",
          path: "/test",
          body: formData,
          headers: {
            "Content-Type": `multipart/form-data`,
          },
        },
        willRespondWith: {
          status: 201,
          body: {
            foo: MatchersV3.like("bar"),
          },
        },
      })
      .executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/test`, {
          headers: {
            "Content-Type": `multipart/form-data`,
          },
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        expect(data.foo).to.equal("bar");
      });
  });
});
