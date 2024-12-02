/* eslint "@typescript-eslint/ban-ts-comment": "off" */
import { mount, ReactWrapper } from "enzyme";
import { axe } from "jest-axe";
import React from "react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import BackLink from "../../../../../components/backLink";
import Button from "../../../../../components/button";
import { ErrorMessageContainer } from "../../../../../components/errorSummary";
import Label from "../../../../../components/label";
import PageTitle from "../../../../../components/pageTitle";
import { TextArea } from "../../../../../components/textarea";
import { TextInput } from "../../../../../components/textInput";
import {
  ButtonNames,
  CreateOrganisationRequestTypes,
  EntityNames,
  UpdateRecordRequestTypes,
} from "../../../../../globals";
import { initialUpdatedTriggerEntity } from "../../../../../globals/pageSelector/redux/model";
import { IHeliosRecord } from "../../../../../model";
import {
  EMPTY_STRING,
  entitySelectState,
  setEntitySelectState,
  viewOrganisationInitialState,
} from "../../../../../utils/test";
import * as transformMethods from "../../../transform";
import Form from "./index";
import * as validationMethods from "./validation";

require("jest-axe/extend-expect");

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useHistory: () => ({
    push: jest.fn(),
    goBack: jest.fn(),
    location: {},
    listen: jest.fn(),
  }),
}));

const existingOrgId = "HL-IZje-0181-680c-4f30-5_O1";

const testValues = {
  organisationName: "BAE",
  organisationComments: "comments",
  id: "",
  entityType: EntityNames.ORGANISATION,
};

const defaultState = {
  Organisation: {
    payload: {
      organisationName: "",
      organisationComments: "",
    },
  },
  RecordDetails: {
    payload: "",
    error: "",
  },
  ApplicationReducer: {
    mode: {
      delete: false,
      modifyRecord: false,
      readOnly: false,
    },
    isLoading: false,
  },
};

async function populateFieldsAndSubmit(
  id: string,
  wrapper: ReactWrapper,
  buttonName: string
) {
  const submitButton = wrapper.find(`Button[name='${buttonName}']`);
  const organisationNameTextInput = wrapper.find(
    "input[name='organisationName']"
  );
  const organisationCommentsTextAreaInput = wrapper.find(
    "textarea[name='organisationComments']"
  );
  const idTextInput = wrapper.find("input[name='id']");
  // @ts-ignore
  organisationNameTextInput.instance().value = testValues.organisationName;
  // @ts-ignore
  organisationCommentsTextAreaInput.instance().value =
    testValues.organisationComments;
  // @ts-ignore
  idTextInput.instance().value = id;

  await act(async () => {
    submitButton.simulate("submit");
  });
}

const mockStore = configureStore();
let wrapper: ReactWrapper;

describe("The OrganisationForm component", () => {
  describe("with a default initial state", () => {
    let store: MockStoreEnhanced<unknown, unknown>;
    beforeEach(() => {
      store = mockStore(defaultState);
      wrapper = mount(
        <Provider store={store}>
          <Form
            updateTriggerState={initialUpdatedTriggerEntity}
            setEntitySelectState={setEntitySelectState}
            entitySelectState={entitySelectState}
          />
        </Provider>
      );
    });

    it("should contain the correct number of components", () => {
      expect(wrapper.find("div")).toHaveLength(6);
      expect(wrapper.find("form")).toHaveLength(1);
      expect(wrapper.find(PageTitle)).toHaveLength(1);
      expect(wrapper.find(Label)).toHaveLength(2);
      expect(wrapper.find(TextInput)).toHaveLength(2);
      expect(wrapper.find('TextInput[type="hidden"]')).toHaveLength(1);

      expect(wrapper.find(TextArea)).toHaveLength(1);
      expect(wrapper.find(Button)).toHaveLength(3);
      expect(wrapper.find(".helios-button-link")).toHaveLength(2);
    });

    it("should be accessible", async () => {
      const results = await axe(wrapper.getDOMNode(), {
        rules: {
          region: { enabled: false }, // this is not a full page so does not need a landmark
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe("with a default initial state and modifyRecord set to true", () => {
    let store: MockStoreEnhanced<unknown, unknown>;

    beforeEach(() => {
      store = mockStore({
        ...viewOrganisationInitialState,
        ApplicationReducer: { mode: { modifyRecord: true } },
      });
      wrapper = mount(
        <Provider store={store}>
          <BrowserRouter>
            <Form
              updateTriggerState={initialUpdatedTriggerEntity}
              setEntitySelectState={setEntitySelectState}
              entitySelectState={entitySelectState}
            />
          </BrowserRouter>
        </Provider>
      );
    });

    it("should contain the correct number of components", () => {
      expect(wrapper.find(BackLink)).toHaveLength(1);
      expect(wrapper.find("div")).toHaveLength(6);
      expect(wrapper.find(Button)).toHaveLength(2);
    });

    it("should be accessible", async () => {
      const results = await axe(wrapper.getDOMNode(), {
        rules: {
          region: { enabled: false }, // this is not a full page so does not need a landmark
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("should dispatch the correct action for a new organisation when modifyRecord set to true", async () => {
      const heliosRecord: IHeliosRecord = {
        heliosReference: "",
        dataOwner: "",
        sourceCode: "",
        reason: "",
        action: "",
        requesterName: "",
        requesterEmailAddress: "",
        requesterTelephoneNumber: "",
        recordExpiryDate: "",
        uniqueSourceIdentifier: "",
        warningMarkers: [],
        officerInstructions: [],
        instructionsComments: "",
        recordComments: "",
        identity: [],
        document: [],
        organisation: [],
        priority: "",
      };

      jest
        .spyOn(transformMethods, "createThreatRecord")
        .mockReturnValueOnce(heliosRecord);

      await populateFieldsAndSubmit(
        testValues.id,
        wrapper,
        ButtonNames.SAVE_AND_CONTINUE
      );
      const expectedAction = [
        {
          type: UpdateRecordRequestTypes.UPDATE_RECORD_IN_PROGRESS,
          payload: {
            heliosRecord,
            updateType: testValues.entityType,
          },
        },
      ];

      expect(store.getActions()).toEqual(expectedAction);
    });
  });

  describe("with populated initial state", () => {
    let store: MockStoreEnhanced<unknown, unknown>;
    beforeEach(() => {
      store = mockStore(defaultState);
      wrapper = mount(
        <Provider store={store}>
          <Form
            updateTriggerState={initialUpdatedTriggerEntity}
            setEntitySelectState={setEntitySelectState}
            entitySelectState={entitySelectState}
          />
        </Provider>
      );
    });

    function createStubFororganisationUniqueOrExists(
      isorganisationUniqueOrExists: boolean
    ) {
      return jest
        .spyOn(validationMethods, "organisationUniqueOrExists")
        .mockReturnValueOnce(isorganisationUniqueOrExists);
    }

    function thenTheActionShouldHaveAppropriatePayload(
      uniqueDocumentStub: any,
      type: any,
      payload: any
    ) {
      const expectedAction = [
        {
          type,
          payload,
        },
      ];
      expect(store.getActions()).toEqual(expectedAction);
      expect(uniqueDocumentStub).toBeCalledTimes(1);
      uniqueDocumentStub.mockRestore();
    }

    it("should be accessible", async () => {
      const results = await axe(wrapper.getDOMNode(), {
        rules: {
          region: { enabled: false }, // this is not a full page so does not need a landmark
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("should dispatch the CreateOrganisationAction when form is populated and submitted", async () => {
      const organisationUniqueOrExistsStub = createStubFororganisationUniqueOrExists(
        true
      );
      await populateFieldsAndSubmit(EMPTY_STRING, wrapper, "Continue");
      thenTheActionShouldHaveAppropriatePayload(
        organisationUniqueOrExistsStub,
        "organisation/CreateOrganisationAction",
        testValues
      );
    });

    it("should dispatch the UpdateOrganisationAction when form is populated and submitted", async () => {
      const organisationUniqueOrExistsStub = createStubFororganisationUniqueOrExists(
        true
      );
      await populateFieldsAndSubmit(existingOrgId, wrapper, "Continue");
      thenTheActionShouldHaveAppropriatePayload(
        organisationUniqueOrExistsStub,
        CreateOrganisationRequestTypes.UPDATE_ORGANISATION_REQUEST,
        { ...testValues, id: existingOrgId }
      );
    });

    it("shouldn't dispatch the CreateOrganisationAction when a duplicate organisation is submitted", async () => {
      const organisationUniqueOrExistsStub = createStubFororganisationUniqueOrExists(
        false
      );
      await populateFieldsAndSubmit(EMPTY_STRING, wrapper, "Continue");
      expect(store.getActions()).toEqual([]);
      expect(organisationUniqueOrExistsStub).toBeCalledTimes(1);
      organisationUniqueOrExistsStub.mockRestore();
    });

    it("should throw an organisation duplication error if the data entered exists", async () => {
      const isUniqueOrExistsStub = createStubFororganisationUniqueOrExists(
        false
      );

      await populateFieldsAndSubmit("", wrapper, "Continue");

      expect(isUniqueOrExistsStub).toBeCalledTimes(1);
      wrapper.update();

      expect(wrapper.find(ErrorMessageContainer).first().text()).toBe(
        "An organisation with these details has already been added to the record. Add a different organisation."
      );

      isUniqueOrExistsStub.mockRestore();
    });
  });
});
