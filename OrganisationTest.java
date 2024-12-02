package uk.gov.homeoffice.helios.tqw.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.JsonContent;

@JsonTest
class OrganisationTest {

  @Autowired
  private JacksonTester<Organisation> underTest;

  @Test
  void testSerializeAndDeserialize() throws Exception {
    Organisation org = new Organisation("East India Company", "comments", "organisation", null, null, null, null, null);

    JsonContent<Organisation> result = underTest.write(org);

    assertThat(result).extractingJsonPathStringValue("@.organisationName").isEqualTo("East India Company");
    assertThat(result).extractingJsonPathStringValue("@.organisationComments").isEqualTo("comments");
    assertThat(result).extractingJsonPathStringValue("@.type").isEqualTo("organisation");
    assertThat(result).extractingJsonPathStringValue("@.companyDirector").isEqualTo(null);
    assertThat(result).extractingJsonPathStringValue("@.companyOwner").isEqualTo(null);
    assertThat(result).extractingJsonPathStringValue("@.phoneNumber").isEqualTo(null);
    assertThat(result).extractingJsonPathStringValue("@.registrationNumber").isEqualTo(null);
    assertThat(result).extractingJsonPathStringValue("@.vatNumber").isEqualTo(null);
  }

  @Test
  void testSerializeAndDeserializeAdditionalInformation() throws Exception {
    Organisation org = new Organisation("East India Company", "comments", "organisation", "John Smith", "Jane Doe", "01234 567890", "12345678", "GB123 4567 89");

    JsonContent<Organisation> result = underTest.write(org);

    assertThat(result).extractingJsonPathStringValue("@.organisationName").isEqualTo("East India Company");
    assertThat(result).extractingJsonPathStringValue("@.organisationComments").isEqualTo("comments");
    assertThat(result).extractingJsonPathStringValue("@.type").isEqualTo("organisation");
    assertThat(result).extractingJsonPathStringValue("@.companyDirector").isEqualTo("John Smith");
    assertThat(result).extractingJsonPathStringValue("@.companyOwner").isEqualTo("Jane Doe");
    assertThat(result).extractingJsonPathStringValue("@.phoneNumber").isEqualTo("01234 567890");
    assertThat(result).extractingJsonPathStringValue("@.registrationNumber").isEqualTo("12345678");
    assertThat(result).extractingJsonPathStringValue("@.vatNumber").isEqualTo("GB123 4567 89");
  }
}
