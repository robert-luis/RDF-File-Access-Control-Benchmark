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
#call
echo "  -Begin querying..."

## Call validator??
## Call output_processer
## done

echo ""
echo "*** Done ***"
echo ""