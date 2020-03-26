#!/bin/bash

echo ""
echo "*** Starting the Benchmark ***"
echo ""

## Clear src/data and output (and src/output?)
rm -r src/data/*
rm -r src/output/*
echo "  -The data folder was cleaned."

## Call datagenerator
ipython data_generator.ipynb
echo "  -The data sets were generated."

## Call js wrapper
echo "  -Begin querying..."
cd src
node wrapper.js
echo "  -...Querying succeeded."
cd ..

## Call validator??
## Call output_processer
## done

echo ""
echo "*** Benchmark completed ***"
echo ""