# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

from flask import Blueprint, g
import datetime
import xlrd.xldate
import random

blueprint = Blueprint('property-taxes-cook-county', __name__)

@blueprint.app_template_filter('xldate_to_datetime')
def xldate_to_datetime(xldate):
    if isinstance(xldate, unicode):
        retval = datetime.datetime.strptime(xldate, '%m/%d/%Y')
    else:
        retval = xlrd.xldate.xldate_as_datetime(xldate, 0)
    return retval

@blueprint.app_template_filter('format_date')
def format_vote_date(date_to_format, format):
    return date_to_format.strftime(format)

@blueprint.app_template_filter('get_video_ref')
def get_video_ref(url):
    """
    plucks a needed reference # from the video url
    """
    retval = url.split("/")
    ref_index = retval.index("videogallery") + 1
    return retval[ref_index]

@blueprint.app_template_filter('generate_id')
def generate_id(number):
    rando = random.random()
    return "myExperience {}".format(rando)

@blueprint.app_template_filter('check_for_methods')
def check_for_methods(methods, part):
    """
        This filter returns true if the specififed story (part) has ANY methodologies in the spreadsheet. 
        If there are none, it returns false.
    """
    for method in methods:
        if method['part'] == part:
            return True
    return False

@blueprint.app_template_filter('get_up_next')
def get_up_next(parts, current_part):
    """
        Takes the entire dict of story parts (day1, day2, etc.) and the current story part (part1, part2 , etc).
        It finds the next story and stashes it inside the reval with it's own key. the rest of the parts
        are put into retval['rest'] 
        
    """
    retval = {}
    for i in range(0, len(parts)):
        if parts[i]['part'] == current_part:
            try: 
                retval['next'] = parts[i+1]
                del parts[i+1]
                retval['rest'] = parts
                break
            except IndexError:
                # This exception exists incase there is no up next, in which case there would be an index error
                retval['next'] = False
                retval['rest'] = parts
    return retval

# Google spreadsheet key
SPREADSHEET_KEY = "1CDBifEOKDp5wc-uZjRDJlYTuiSvNE2pdbDNd2OPusyY"

# Exclude these files from publication
EXCLUDES = ['node_scripts', '_storage','storage', '*.md', 'requirements.txt', 'node_modules', 'sass', 'js/src', 'package.json', 'Gruntfile.js']

# Spreadsheet cache lifetime in seconds. (Default: 4)
# SPREADSHEET_CACHE_TTL = 4

# Create JSON data at ./data.json, disabled by default
# CREATE_JSON = True

# Get context from a local file or URL. This file can be a CSV or Excel
# spreadsheet file. Relative, absolute, and remote (http/https) paths can be 
# used.
# CONTEXT_SOURCE_FILE = ""

# EXPERIMENTAL: Path to a credentials file to authenticate with Google Drive.
# This is useful for for automated deployment. This option may be replaced by
# command line flag or environment variable. Take care not to commit or publish
# your credentials file.
# CREDENTIALS_PATH = ""

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    
    "production": "graphics.chicagotribune.com/news/watchdog/property-taxes-cook-county",
    "staging": "apps.beta.tribapps.com/property-taxes-cook-county",
}

# Default template variables
DEFAULT_CONTEXT = {
   'OMNITURE': {   'domain': 'chicagotribune.com',
                    'section': 'news',
                    'sitename': 'Chicago Tribune',
                    'subsection': 'watchdog',
                    'subsubsection': '',
                    'type': 'dataproject'},
    'name': 'property-taxes-cook-county',
    'title': 'Finding the faultlines of inequality in taxes'
}