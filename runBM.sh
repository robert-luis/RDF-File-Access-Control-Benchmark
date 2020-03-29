#!/bin/bash

echo ""
echo "*** Starting the Benchmark ***"
echo ""

## Clear src/data and output (and src/output?)
rm -r src/data/*
rm -r src/output/*
rm -r results/*
echo "  - The data folder was cleaned."

## Call datagenerator
ipython data_generator.ipynb
echo "  - The data sets were generated."

## Call js wrapper
echo "  - Begin querying..."
cd src
node wrapper.js
echo "     ... "
echo "  - Querying succeeded."
cd ..

## Call output_processer
ipython output_processor.ipynb
echo "  - The results were processed."

echo ""
echo "*** Benchmark completed ***"
echo ""