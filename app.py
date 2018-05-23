# import necessary libraries
import pandas as pd

from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect, desc
from sqlalchemy.sql import select

from flask import (
    Flask,
    render_template,
    jsonify)

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to the tables
SamplesDB = Base.classes.samples
SamplesMetadataDB = Base.classes.samples_metadata
OtuDB = Base.classes.otu

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
BB_SAMPLE = 'BB_940'  ## Initial value at load up time

# Query the database and send the jsonified results

@app.route('/names')
def names():
    """List of sample names.
    Returns a list of sample names in the format
    [
        "BB_940",
        "BB_941",
        "BB_943",
        "BB_944",
        "BB_945",
        "BB_946",
        "BB_947",
        ...
    ]

    """
    inspector = inspect(engine)
    columns = inspector.get_columns('samples')
    names=[]
    for column in columns:
        names.append(column["name"])

    #print(names)
    return jsonify(names)
    




@app.route('/otu')
def otu():
    """List of OTU descriptions.

    Returns a list of OTU descriptions in the following format

    [
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
        "Bacteria",
        "Bacteria",
        "Bacteria",
        ...
    ]
    """
    print('Gettin all OTU descriptions')
    results = session.query(OtuDB.lowest_taxonomic_unit_found).all()
    descriptions=[]
    for r in results:
        descriptions.append(r[0])
    return jsonify(list(set(descriptions)))


@app.route('/metadata/<sample>')
def metadata(sample):
    """MetaData for a given sample.

    Args: Sample in the format: `BB_940`

    Returns a json dictionary of sample metadata in the format

    {
        AGE: 24,
        BBTYPE: "I",
        ETHNICITY: "Caucasian",
        GENDER: "F",
        LOCATION: "Beaufort/NC",
        SAMPLEID: 940
    }
    """
    sel = [SamplesMetadataDB.AGE, SamplesMetadataDB.BBTYPE,
            SamplesMetadataDB.ETHNICITY, SamplesMetadataDB.GENDER,
            SamplesMetadataDB.LOCATION]

    sampleid = sample[3:] #remove leading BB_ characters
    print("inside metadata "+sampleid)
    results = session.query(*sel).  \
                filter(SamplesMetadataDB.SAMPLEID==sampleid).all()

    metadata = {
        'AGE':results[0][0],
        'BBTYPE':results[0][1],
        'ETHNICITY':results[0][2],
        'GENDER':results[0][3],
        'LOCATION':results[0][4],
        'SAMPLEID':int(sampleid)
    }

    print(metadata)
    return jsonify(metadata)

@app.route('/wfreq/<sample>')
def weekly(sample):
    """Weekly Washing Frequency as a number.

    Args: Sample in the format: `BB_940`

    Returns an integer value for the weekly washing frequency `WFREQ`
    """
    sampleid = sample[3:] #remove leading BB_ characters

    results = session.query(SamplesMetadataDB.WFREQ). \
                filter(SamplesMetadataDB.SAMPLEID == sampleid).all()

    print("This is weekly sample id "+sampleid)
    print(results)
    if results:
        weeklyfrequency = results[0][0]
    else:
        weeklyfrequency = 0

    return jsonify(weeklyfrequency)
    

@app.route('/samples/<sample>')
def samples(sample):
    """OTU IDs and Sample Values for a given sample.

    Sort your Pandas DataFrame (OTU ID and Sample Value)
    in Descending Order by Sample Value

    Return a list of dictionaries containing sorted lists  for `otu_ids`
    and `sample_values`

    [
        {
            otu_ids: [
                1166,
                2858,
                481,
                ...
            ],
            sample_values: [
                163,
                126,
                113,
                ...
            ]
        }
    ]
    """
    sample_values = []
    otu_ids = []
    hov_text =[]
    trace = []
    columns = ['otu_id',sample]
    print(columns)

    # results = session.query(select(from_obj=SamplesDB, columns=columns)). \
    #             all() 
    sel = 'samples.'+sample
    results = session.query(sel,SamplesDB.otu_id, OtuDB.lowest_taxonomic_unit_found).\
                    filter(SamplesDB.otu_id == OtuDB.otu_id).order_by(desc(sel)).all()
    
    print(results[0])
    
    for r in results:
        if r[0] != 0:  # interested in non zero values
            sample_values.append(r[0])
            otu_ids.append(r[1])
            hov_text.append(r[2])

    trace = {
        "otu_ids": otu_ids,
        "sample_values":sample_values,
        "otu_desc":hov_text
    }
    return jsonify(trace)

    

@app.route('/')
def home():
    sample_data = metadata(BB_SAMPLE)
    weekly_freq = weekly(BB_SAMPLE)
    return render_template("index.html", sample_data=sample_data, weekly_freq=weekly_freq)



if __name__ == "__main__":
    app.run(debug=True)

