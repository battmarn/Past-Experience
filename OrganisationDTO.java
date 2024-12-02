package uk.gov.homeoffice.helios.threat.index.store.reader.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static uk.gov.homeoffice.helios.threat.index.store.reader.utility.DataConversion.nullable;
import static uk.gov.homeoffice.helios.threat.index.store.reader.utility.DtoUtil.getComments;

@Data
public class OrganisationDTO {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private String objectIdentifier;
    private String organisationName;
    private String organisationComments;
    private String type;
    private String companyDirector;
    private String companyOwner;
    private String phoneNumber;
    private String registrationNumber;
    private String vatNumber;
    private String recordExpiryDate;
    private List<String> addresses;

    public OrganisationDTO() {
    }

    public OrganisationDTO(String organisationJson) {
        JsonNode organisationNode = null;
        try {
            organisationNode = OBJECT_MAPPER.readTree(organisationJson);
        }
        catch (JsonProcessingException e) {
            throw new IllegalStateException("Unable to parse JSON", e);
        }
        this.objectIdentifier = organisationNode.get("object_identifier").asText();
        this.organisationName = organisationNode.get("organisation_name").asText();
        this.organisationComments = getComments(organisationNode);

        this.type = nullable(organisationNode, "type");

        this.companyDirector = nullable(organisationNode, "company_director");
        this.companyOwner = nullable(organisationNode, "company_owner");
        this.phoneNumber = nullable(organisationNode, "phone_number");
        this.registrationNumber = nullable(organisationNode, "registration_number");
        this.vatNumber = nullable(organisationNode, "vat_number");
        JsonNode addressNode = organisationNode.get("organisation_address");
        this.addresses = addressNode!= null && !addressNode.isNull() ?
                OBJECT_MAPPER.convertValue(addressNode, ArrayList.class) : new ArrayList<>();
        this.recordExpiryDate = getRecordExpiryDate(nullable(organisationNode, "record_expiry_date"));

    }

    private String getRecordExpiryDate(String expiryDate) {
        if(expiryDate != null) {
            return DateTimeFormatter.ofPattern("dd/MM/yyyy").format(LocalDate.parse(expiryDate));
        }else{
            return null;
        }
    }
}
