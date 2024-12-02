package uk.gov.homeoffice.helios.threat.index.store.reader.model;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Data;

@Data
public class RecordRequest {

    private String recordNumber;
    private String uniqueSourceIdentifier;
    private String dataOwner;
    private String action;
    private String reason;
    @JsonAlias("sourceCode")
    private String source;

    public RecordRequest() {
    }

    public RecordRequest(final String recordNumberOrUSI, final String searchType) {
        if (searchType == "recordNumber") {
            this.recordNumber = recordNumberOrUSI;
        } else
            this.uniqueSourceIdentifier = recordNumberOrUSI;
    }

    public RecordRequest(final String uniqueSourceIdentifier) {
        this.uniqueSourceIdentifier = uniqueSourceIdentifier;
    }

    public RecordRequest(String dataOwner, String action, String reason, String source) {
        this.dataOwner = dataOwner;
        this.action = action;
        this.reason = reason;
        this.source = source;
    }
}
